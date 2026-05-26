import os
import tempfile
from dataclasses import dataclass

from ai_engine.services.image_inference import run_densenet121_inference
from uploads.services.text_categorization import categorize_news_text
from uploads.services.trust_score import compute_trust_score, decide_status

from uploads.services.errors import ApiError
from uploads.services.validators import validate_image, validate_title_text


@dataclass
class UploadAnalysis:
    category: str
    text_similarity_score: float
    ai_confidence: float
    trust_score: float
    status: str          # "REAL" | "AI_GEN" | "UNCERTAIN"
    explanation: str


# Human-readable threshold descriptions
_THRESHOLD_NOTE = (
    "Confidence ≥ 0.80 → REAL (likely a real photograph); "
    "≥ 0.55 → UNCERTAIN (sent to human review); "
    "< 0.55 → AI_GEN (likely AI-generated / synthetic)."
)


def _build_explanation(status: str, ai_confidence: float) -> str:
    pct = round(ai_confidence * 100, 1)
    if status == "REAL":
        return (
            f"The image analysis model is {pct}% confident this is a real photograph. "
            f"{_THRESHOLD_NOTE}"
        )
    if status == "AI_GEN":
        return (
            f"The image analysis model is {pct}% confident the attached image is "
            f"AI-generated or synthetic (trained on the CIFAKE dataset). "
            f"{_THRESHOLD_NOTE}"
        )
    # UNCERTAIN
    return (
        f"The model returned a confidence of {pct}%, which falls in the uncertain "
        f"range. This upload has been queued for human review. "
        f"{_THRESHOLD_NOTE}"
    )


def analyze_upload(*, title: str, text: str, image_file) -> UploadAnalysis:
    validate_title_text(title, text)
    validate_image(image_file)

    # Text analysis — category only; similarity score is NOT used for the
    # authenticity decision (the model is image-only).
    ta = categorize_news_text(text)
    category = ta.category
    text_similarity_score = float(ta.similarity_score)

    # Write image to temp file for the model
    with tempfile.NamedTemporaryFile(delete=False, suffix=".img") as tmp:
        for chunk in image_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        img_res = run_densenet121_inference(tmp_path)
        ai_confidence = float(img_res.confidence)
    except FileNotFoundError as e:
        raise ApiError(code="model_missing", detail=str(e), status=500)
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass

    trust_score = float(compute_trust_score(ai_confidence, text_similarity_score))
    status = decide_status(trust_score)
    explanation = _build_explanation(status, ai_confidence)

    return UploadAnalysis(
        category=category,
        text_similarity_score=round(text_similarity_score, 4),
        ai_confidence=round(ai_confidence, 4),
        trust_score=round(trust_score, 4),
        status=status,
        explanation=explanation,
    )
