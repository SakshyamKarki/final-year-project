from django.db import models


class NewsUpload(models.Model):
    class Status(models.TextChoices):
        REAL = "REAL", "Real"
        FAKE = "FAKE", "Fake"
        SUSPICIOUS = "SUSPICIOUS", "Suspicious"

    class ModerationStatus(models.TextChoices):
        NONE = "NONE", "None"
        QUEUED = "QUEUED", "Queued"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="news_uploads"
    )

    title = models.CharField(max_length=250)
    text = models.TextField()
    image = models.ImageField(upload_to="news_uploads/")

    category = models.CharField(max_length=50, blank=True)

    ai_result = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUSPICIOUS
    )
    ai_confidence = models.FloatField(default=0.0)

    text_similarity_score = models.FloatField(default=0.0)
    trust_score = models.FloatField(default=0.0)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.SUSPICIOUS
    )
    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.NONE,
    )

    explanation = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"[{self.pk}] {self.title} ({self.status})"