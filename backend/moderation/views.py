from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as drf_status

from core.permissions import IsAdminUser
from uploads.models import NewsUpload
from users.models import User
from moderation.serializers import (
    ModerationItemSerializer,
    ModerationUpdateSerializer,
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
)


def err(code: str, detail: str, status_code: int):
    return Response({"code": code, "detail": detail}, status=status_code)


class ModerationQueueView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Queue includes UNCERTAIN *and* AI_GEN items — both need human review
        qs = NewsUpload.objects.filter(
            status__in=[
                NewsUpload.Status.UNCERTAIN,
                NewsUpload.Status.AI_GEN,
            ],
            moderation_status=NewsUpload.ModerationStatus.QUEUED,
            is_deleted=False,
        ).order_by("-created_at")
        data = ModerationItemSerializer(qs, many=True, context={"request": request}).data
        return Response(data, status=200)


class ModerationItemActionView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk: int):
        try:
            upload = NewsUpload.objects.get(pk=pk, is_deleted=False)
        except NewsUpload.DoesNotExist:
            return err("not_found", "Not found.", 404)

        ser = ModerationUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        action = ser.validated_data["action"]

        if upload.status not in (
            NewsUpload.Status.UNCERTAIN,
            NewsUpload.Status.AI_GEN,
        ):
            return err(
                "invalid_state",
                "Only UNCERTAIN or AI_GEN uploads can be moderated.",
                400,
            )

        upload.moderation_status = (
            NewsUpload.ModerationStatus.APPROVED
            if action == "approve"
            else NewsUpload.ModerationStatus.REJECTED
        )
        # Record audit trail
        upload.moderated_by = request.user
        upload.moderated_at = timezone.now()
        upload.save(update_fields=["moderation_status", "moderated_by", "moderated_at"])

        out = ModerationItemSerializer(upload, context={"request": request}).data
        return Response(out, status=drf_status.HTTP_200_OK)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        qs = User.objects.all().order_by("-date_joined")
        return Response(AdminUserListSerializer(qs, many=True).data, status=200)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def patch(self, request, pk: int):
        try:
            u = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return err("not_found", "Not found.", 404)

        # Guardrails: prevent modifying yourself in dangerous ways
        if u.pk == request.user.pk:
            if "is_staff" in request.data and request.data.get("is_staff") in [
                False, "false", "False", 0, "0"
            ]:
                return err(
                    "forbidden_self_demote",
                    "You cannot remove your own staff access.",
                    403,
                )
            if "is_active" in request.data and request.data.get("is_active") in [
                False, "false", "False", 0, "0"
            ]:
                return err(
                    "forbidden_self_deactivate",
                    "You cannot deactivate your own account.",
                    403,
                )

        ser = AdminUserUpdateSerializer(u, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(AdminUserListSerializer(u).data, status=200)

    def delete(self, request, pk: int):
        try:
            u = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return err("not_found", "Not found.", 404)

        if u.pk == request.user.pk:
            return err(
                "forbidden_self_delete",
                "You cannot delete your own account.",
                403,
            )

        # Soft-delete all uploads belonging to this user instead of CASCADE hard-delete.
        # The User row itself is still hard-deleted; upload records are retained for audit.
        now = timezone.now()
        NewsUpload.objects.filter(user=u, is_deleted=False).update(
            is_deleted=True,
            deleted_at=now,
        )
        u.delete()
        return Response(status=204)
