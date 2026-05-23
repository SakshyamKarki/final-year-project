from rest_framework import serializers
from uploads.models import NewsUpload


class FeedItemSerializer(serializers.ModelSerializer):
    uploader_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsUpload
        fields = ["id", "title", "image_url", "category", "trust_score", "status", "uploader_name", "created_at"]

    def get_uploader_name(self, obj):
        return obj.user.username if obj.user_id else None

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None