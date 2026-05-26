from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import RegisterView, MeView, LogoutView

# Auth endpoints use a tighter "auth" throttle scope (10/min) to limit
# brute-force attempts against login/register.
class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_scope = "auth"

class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_scope = "auth"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", ThrottledTokenObtainPairView.as_view(), name="login"),
    path("refresh/", ThrottledTokenRefreshView.as_view(), name="refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
]
