from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView

from uploads.models import NewsUpload
from uploads.serializers import NewsUploadListSerializer
from uploads.services.pipeline import analyze_upload
from uploads.services.errors import ApiError


class UploadNewsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            title = request.data.get("title", "")
            text = request.data.get("text", "")
            image = request.FILES.get("image")

            analysis = analyze_upload(title=title, text=text, image_file=image)

            upload = NewsUpload.objects.create(
                user=request.user,
                title=title,
                text=text,
                image=image,
                category=analysis.category,
                text_similarity_score=analysis.text_similarity_score,
                ai_confidence=analysis.ai_confidence,
                trust_score=analysis.trust_score,
                status=analysis.status,
                # keep ai_result aligned with status for now (optional but consistent)
                ai_result=analysis.status,
                moderation_status="QUEUED" if analysis.status == "SUSPICIOUS" else "NONE",
                explanation=analysis.explanation,
            )

            return Response(
                NewsUploadListSerializer(upload, context={"request": request}).data,
                status=201,
            )

        except ApiError as e:
            return e.to_response()
        except Exception as e:
            return Response({"code": "server_error", "detail": str(e)}, status=500)


class UserUploadsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = NewsUpload.objects.filter(user=request.user)
        return Response(
            NewsUploadListSerializer(qs, many=True, context={"request": request}).data
        )


class UploadDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NewsUploadListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = NewsUpload.objects.all()
        if user.is_staff or user.is_superuser:
            return qs
        return qs.filter(user=user)

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx