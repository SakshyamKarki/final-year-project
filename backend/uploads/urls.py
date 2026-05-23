from django.urls import path
from uploads.views import UploadNewsView, UserUploadsView, UploadDetailView

urlpatterns = [
    path("upload/", UploadNewsView.as_view(), name="upload"),
    path("user/uploads/", UserUploadsView.as_view(), name="user-uploads"),
    path("uploads/<int:pk>/", UploadDetailView.as_view(), name="upload-detail"),
]