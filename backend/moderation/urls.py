from django.urls import path
from moderation.views import (
    ModerationQueueView,
    ModerationItemActionView,
    AdminUserListView,
    AdminUserDetailView,
)

urlpatterns = [
    path("moderation/", ModerationQueueView.as_view(), name="moderation"),
    path("moderation/<int:pk>/", ModerationItemActionView.as_view(), name="moderation-action"),

    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]