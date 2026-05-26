"""
Migration 0004 — Audit trail, soft delete, composite indexes, label rename.

Label rename strategy (non-destructive):
  FAKE       → AI_GEN
  SUSPICIOUS → UNCERTAIN

We run a RunPython step to migrate existing data, then alter the field
choices. Because CharField stores the raw string value, renaming the
choice label (verbose name) is a no-op in the DB; only rows with the OLD
key strings ('FAKE', 'SUSPICIOUS') need to be updated in place.
"""
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


def migrate_legacy_labels(apps, schema_editor):
    NewsUpload = apps.get_model("uploads", "NewsUpload")
    # FAKE → AI_GEN
    NewsUpload.objects.filter(ai_result="FAKE").update(ai_result="AI_GEN")
    NewsUpload.objects.filter(status="FAKE").update(status="AI_GEN")
    # SUSPICIOUS → UNCERTAIN
    NewsUpload.objects.filter(ai_result="SUSPICIOUS").update(ai_result="UNCERTAIN")
    NewsUpload.objects.filter(status="SUSPICIOUS").update(status="UNCERTAIN")


def reverse_migrate_legacy_labels(apps, schema_editor):
    NewsUpload = apps.get_model("uploads", "NewsUpload")
    NewsUpload.objects.filter(ai_result="AI_GEN").update(ai_result="FAKE")
    NewsUpload.objects.filter(status="AI_GEN").update(status="FAKE")
    NewsUpload.objects.filter(ai_result="UNCERTAIN").update(ai_result="SUSPICIOUS")
    NewsUpload.objects.filter(status="UNCERTAIN").update(status="SUSPICIOUS")


class Migration(migrations.Migration):
    atomic = False
    
    dependencies = [
        ("uploads", "0003_newsupload_explanation"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── 1. Add audit-trail columns ───────────────────────────────────
        migrations.AddField(
            model_name="newsupload",
            name="moderated_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="moderated_uploads",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="newsupload",
            name="moderated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ── 2. Soft-delete columns ───────────────────────────────────────
        migrations.AddField(
            model_name="newsupload",
            name="is_deleted",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="newsupload",
            name="deleted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ── 3. Migrate legacy label strings in data ──────────────────────
        migrations.RunPython(migrate_legacy_labels, reverse_migrate_legacy_labels),

        # ── 4. Update field choices (DB stores raw string — no schema change) ──
        migrations.AlterField(
            model_name="newsupload",
            name="ai_result",
            field=models.CharField(
                choices=[
                    ("REAL", "Real photograph"),
                    ("AI_GEN", "AI-generated"),
                    ("UNCERTAIN", "Uncertain"),
                ],
                default="UNCERTAIN",
                max_length=20,
            ),
        ),
        migrations.AlterField(
            model_name="newsupload",
            name="status",
            field=models.CharField(
                choices=[
                    ("REAL", "Real photograph"),
                    ("AI_GEN", "AI-generated"),
                    ("UNCERTAIN", "Uncertain"),
                ],
                default="UNCERTAIN",
                max_length=20,
            ),
        ),

        # ── 5. Add db_index to foreign key and frequently-filtered fields ─
        migrations.AlterField(
            model_name="newsupload",
            name="user",
            field=models.ForeignKey(
                db_index=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="news_uploads",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="newsupload",
            name="category",
            field=models.CharField(blank=True, db_index=True, max_length=50),
        ),
        migrations.AlterField(
            model_name="newsupload",
            name="trust_score",
            field=models.FloatField(db_index=True, default=0.0),
        ),

        # ── 6. Add composite indexes ─────────────────────────────────────
        migrations.AddIndex(
            model_name="newsupload",
            index=models.Index(
                fields=["status", "moderation_status", "-created_at"],
                name="uploads_feed_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="newsupload",
            index=models.Index(
                fields=["status", "moderation_status"],
                name="uploads_mod_queue_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="newsupload",
            index=models.Index(
                fields=["is_deleted"],
                name="uploads_softdelete_idx",
            ),
        ),
    ]
