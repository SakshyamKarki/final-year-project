from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from uploads.models import NewsUpload
from feed.serializers import FeedItemSerializer


class FeedListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        real_qs = NewsUpload.objects.filter(status=NewsUpload.Status.REAL).order_by("-created_at")
        approved_suspicious = NewsUpload.objects.filter(
            status=NewsUpload.Status.SUSPICIOUS,
            moderation_status=NewsUpload.ModerationStatus.APPROVED,
        ).order_by("-created_at")

        items = list(real_qs) + list(approved_suspicious)
        items.sort(key=lambda x: x.created_at, reverse=True)

        data = FeedItemSerializer(items, many=True, context={"request": request}).data
        return Response(data, status=200)