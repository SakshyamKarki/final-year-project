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
    """
    Generate a concise, professional explanation of the model verdict.
    Thresholds: >=0.80 REAL, 0.55-0.79 UNCERTAIN, <0.55 AI_GEN.
    """
    pct = round(ai_confidence * 100, 1)

    if status == "REAL":
        return (
            f"The model predicts this image is likely a genuine photograph "
            f"with {pct}% confidence. Images above 90% confidence are automatically approved."
        )
    if status == "AI_GEN":
        return (
            f"The model predicts this image may be AI-generated or synthetically "
            f"manipulated ({pct}% confidence). This item has been flagged for review."
        )
    # UNCERTAIN (55–79%)
    return (
        f"The prediction confidence ({pct}%) falls within the uncertain range (65–90%). "
        f"Human moderation is recommended before this item is published."
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
