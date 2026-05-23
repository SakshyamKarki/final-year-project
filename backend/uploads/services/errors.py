from dataclasses import dataclass
from rest_framework.response import Response


@dataclass
class ApiError(Exception):
    code: str
    detail: str
    status: int = 400

    def to_response(self) -> Response:
        return Response({"code": self.code, "detail": self.detail}, status=self.status)