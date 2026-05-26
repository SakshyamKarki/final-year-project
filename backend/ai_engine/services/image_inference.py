import os
from dataclasses import dataclass

import torch
import torch.nn as nn
from PIL import Image
from decouple import config
from django.conf import settings
from torchvision import models, transforms

# Cache loaded model in memory
_MODEL = None


@dataclass
class ImageInferenceResult:
    label: str
    confidence: float


def _device():
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _resolve_models_dir() -> str:
    raw = config("ML_MODELS_DIR", default="ml_models")
    if not os.path.isabs(raw):
        return str(settings.BASE_DIR / raw)
    return raw


def _load_model(model_path: str):
    """
    Instantiate DenseNet121 with the same classifier head used during training,
    then load the saved state_dict. The notebook saved state_dict only
    (torch.save(model.state_dict(), path)), so we must build the architecture first.
    """
    # Build backbone without pretrained weights
    backbone = models.densenet121(weights=None)

    in_features = backbone.classifier.in_features  # 1024 for DenseNet121

    # Classifier must match training notebook exactly
    backbone.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, 2),
    )

    # Load saved weights
    state_dict = torch.load(model_path, map_location=_device())
    backbone.load_state_dict(state_dict)
    backbone.eval()
    return backbone


def _get_model():
    global _MODEL
    if _MODEL is not None:
        return _MODEL

    models_dir = _resolve_models_dir()
    model_path = os.path.join(models_dir, "DenseNet121.pth")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            "DenseNet121.pth not found. Put it in backend/ml_models/ or set ML_MODELS_DIR."
        )

    _MODEL = _load_model(model_path).to(_device())
    return _MODEL


def _preprocess_image(image_path: str):
    img = Image.open(image_path).convert("RGB")

    # Must match training transforms exactly: 64x64 resize + ImageNet normalisation
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    return preprocess(img).unsqueeze(0).to(_device())  # [1, C, H, W]


def run_densenet121_inference(image_path: str) -> ImageInferenceResult:
    """
    Returns label ("REAL" or "AI_GEN") and confidence in [0, 1].
    Model outputs 2-class logits; softmax index 1 = REAL, index 0 = AI_GEN.
    """
    model = _get_model()
    x = _preprocess_image(image_path)

    with torch.no_grad():
        logits = model(x)                          # shape [1, 2]
        probs = torch.softmax(logits, dim=1)[0]    # shape [2]
        real_prob = float(probs[1].item())         # index 1 = REAL class

    fake_prob = 1.0 - real_prob

    label = "REAL" if real_prob >= fake_prob else "AI_GEN"

    confidence = max(real_prob, fake_prob)

    return ImageInferenceResult(
        label=label,
        confidence=confidence,
    )


def as_dict(res: ImageInferenceResult) -> dict:
    return {"label": res.label, "confidence": float(res.confidence)}