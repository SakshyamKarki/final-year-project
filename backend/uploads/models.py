from django.db import models


class NewsUpload(models.Model):
    """
    Stores a user-submitted news item (title + text + image) together with
    results from the AI-generated-image-detection pipeline.

    Label semantics (DenseNet121 trained on CIFAKE):
      REAL       — model is confident the image is a real photograph
      AI_GEN     — model is confident the image is AI-generated / synthetic
      UNCERTAIN  — confidence is too low to decide; routes to moderation

    The legacy labels FAKE / SUSPICIOUS are preserved as aliases in the
    migration for backward compatibility with any existing rows, but new
    code should use the Status choices below.
    """

    class Status(models.TextChoices):
        REAL = "REAL", "Real photograph"
        AI_GEN = "AI_GEN", "AI-generated"
        UNCERTAIN = "UNCERTAIN", "Uncertain"

    class ModerationStatus(models.TextChoices):
        NONE = "NONE", "None"
        QUEUED = "QUEUED", "Queued for review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="news_uploads",
        db_index=True,
    )

    title = models.CharField(max_length=250)
    text = models.TextField()
    image = models.ImageField(upload_to="news_uploads/")

    category = models.CharField(max_length=50, blank=True, db_index=True)

    # ── AI pipeline results ──────────────────────────────────────────────
    ai_result = models.CharField(
        max_length=20, choices=Status.choices, default=Status.UNCERTAIN, db_index=True
    )
    ai_confidence = models.FloatField(default=0.0)

    # text_similarity_score is used only for categorisation, not authenticity
    text_similarity_score = models.FloatField(default=0.0)
    trust_score = models.FloatField(default=0.0, db_index=True)

    # ── Lifecycle status ─────────────────────────────────────────────────
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.UNCERTAIN, db_index=True
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.NONE,
        db_index=True,
    )

    explanation = models.TextField(blank=True, default="")

    # ── Audit trail ──────────────────────────────────────────────────────
    moderated_by = models.ForeignKey(
        "users.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="moderated_uploads",
    )
    moderated_at = models.DateTimeField(null=True, blank=True)

    # ── Soft delete ──────────────────────────────────────────────────────
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            # Common query pattern: feed list (status + moderation + created_at)
            models.Index(
                fields=["status", "moderation_status", "-created_at"],
                name="uploads_feed_idx",
            ),
            # Moderation queue
            models.Index(
                fields=["status", "moderation_status"],
                name="uploads_mod_queue_idx",
            ),
        ]

    def __str__(self):
        return f"[{self.pk}] {self.title} ({self.status})"
