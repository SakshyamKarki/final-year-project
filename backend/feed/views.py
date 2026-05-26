from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from uploads.models import NewsUpload
from feed.serializers import FeedItemSerializer


class FeedListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # REAL items appear immediately
        real_qs = NewsUpload.objects.filter(
            status=NewsUpload.Status.REAL,
            is_deleted=False,
        ).order_by("-created_at")

        # UNCERTAIN / AI_GEN items appear only after a moderator approves them
        approved_review = NewsUpload.objects.filter(
            status__in=[NewsUpload.Status.UNCERTAIN, NewsUpload.Status.AI_GEN],
            moderation_status=NewsUpload.ModerationStatus.APPROVED,
            is_deleted=False,
        ).order_by("-created_at")

        items = list(real_qs) + list(approved_review)
        items.sort(key=lambda x: x.created_at, reverse=True)

        data = FeedItemSerializer(items, many=True, context={"request": request}).data
        return Response(data, status=200)
