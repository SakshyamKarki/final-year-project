from rest_framework.permissions import BasePermission


def is_admin_user(user) -> bool:
    if not user or not user.is_authenticated:
        return False
    return bool(getattr(user, "is_superuser", False) or getattr(user, "is_staff", False))


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)