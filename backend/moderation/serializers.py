from rest_framework import serializers
from uploads.models import NewsUpload
from users.models import User


class ModerationItemSerializer(serializers.ModelSerializer):
    uploader_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsUpload
        fields = [
            "id", "title", "text", "image_url",
            "category", "ai_result", "ai_confidence",
            "text_similarity_score", "trust_score",
            "status", "moderation_status",
            "uploader_name", "created_at",
        ]

    def get_uploader_name(self, obj):
        return obj.user.username if obj.user_id else None

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ModerationUpdateSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])


class AdminUserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_active", "is_staff", "is_superuser", "date_joined"]


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["is_active", "is_staff"]