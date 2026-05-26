from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from users.serializers import RegisterSerializer, MeSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "auth"

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response({"detail": "Registered successfully."}, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data, status=200)


class LogoutView(APIView):
    """
    Blacklists the provided refresh token so it can't be used again.
    The access token will expire naturally (8 h). For immediate revocation
    you would need a short-lived access token or a token store — this is
    the standard SimpleJWT approach.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"code": "missing_token", "detail": "refresh token is required."},
                status=400,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            # Already blacklisted or invalid — treat as successful logout
            pass
        return Response({"detail": "Logged out."}, status=200)
