from PIL import Image
from .errors import ApiError


ALLOWED_IMAGE_MIMES = {"image/png", "image/jpeg", "image/webp"}
MAX_IMAGE_BYTES = 15 * 1024 * 1024

TITLE_MIN = 5
TITLE_MAX = 250  
TEXT_MIN = 20
TEXT_MAX = 8000


def validate_title_text(title: str, text: str) -> None:
    title = (title or "").strip()
    text = (text or "").strip()

    if not (TITLE_MIN <= len(title) <= TITLE_MAX):
        raise ApiError(
            code="invalid_title",
            detail=f"Title must be {TITLE_MIN}-{TITLE_MAX} characters.",
            status=400,
        )
    if not (TEXT_MIN <= len(text) <= TEXT_MAX):
        raise ApiError(
            code="invalid_text",
            detail=f"Text must be {TEXT_MIN}-{TEXT_MAX} characters.",
            status=400,
        )


def validate_image(uploaded_file) -> None:
    if uploaded_file is None:
        raise ApiError(code="missing_image", detail="Image is required.", status=400)

    ctype = getattr(uploaded_file, "content_type", None)
    if ctype not in ALLOWED_IMAGE_MIMES:
        raise ApiError(
            code="unsupported_image_type",
            detail="Unsupported image type. Use PNG, JPG, or WEBP.",
            status=400,
        )

    size = getattr(uploaded_file, "size", 0) or 0
    if size > MAX_IMAGE_BYTES:
        raise ApiError(
            code="image_too_large",
            detail="Image too large. Max size is 15MB.",
            status=400,
        )

    # Corrupt image protection
    try:
        uploaded_file.seek(0)
        img = Image.open(uploaded_file)
        img.verify()
    except Exception:
        raise ApiError(
            code="invalid_image",
            detail="Invalid/corrupted image file.",
            status=400,
        )
    finally:
        try:
            uploaded_file.seek(0)
        except Exception:
            pass