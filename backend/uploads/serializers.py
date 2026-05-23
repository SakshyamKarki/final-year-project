from rest_framework import serializers
from uploads.models import NewsUpload


class NewsUploadCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True)

    class Meta:
        model = NewsUpload
        fields = ["title", "text", "image"]


class NewsUploadListSerializer(serializers.ModelSerializer):
    uploader_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsUpload
        fields = [
            "id",
            "title",
            "text",
            "image_url",
            "category",
            "ai_result",
            "ai_confidence",
            "text_similarity_score",
            "trust_score",
            "status",
            "moderation_status",
            "explanation",
            "uploader_name",
            "created_at",
        ]

    def get_uploader_name(self, obj):
        return obj.user.username if obj.user_id else None

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None