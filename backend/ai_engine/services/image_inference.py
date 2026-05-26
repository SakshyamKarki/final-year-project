import os
from dataclasses import dataclass

import torch
from PIL import Image
from decouple import config
from django.conf import settings
from torchvision import transforms
import torchvision.models as models
import torch.nn as nn


# Cache the loaded model in memory so we don't reload weights every request
_MODEL = None


@dataclass
class ImageInferenceResult:
    label: str
    confidence: float


def _device():
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _resolve_models_dir() -> str:
    raw = config("ML_MODELS_DIR", default="ml_models")

    # relative path like "ml_models", resolve relative to backend/ (BASE_DIR)
    models_dir = raw
    if not os.path.isabs(models_dir):
        models_dir = str(settings.BASE_DIR / models_dir)
    return models_dir


def _load_model(model_path: str):
    """
    Load DenseNet121 CIFAKE classifier from state_dict checkpoint.
    """

    # Create DenseNet121 architecture
    model = models.densenet121(weights=None)

    # Match training notebook classifier
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(model.classifier.in_features, 2)
    )

    # Load checkpoint weights
    state_dict = torch.load(
        model_path,
        map_location=_device()
    )

    model.load_state_dict(state_dict)

    # Evaluation mode
    model.eval()

    return model


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

    preprocess = transforms.Compose([
        transforms.Resize((64, 64)),  # MUST match training
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        ),
    ])

    x = preprocess(img).unsqueeze(0)
    return x.to(_device())


def run_densenet121_inference(image_path: str) -> ImageInferenceResult:
    """
    Returns:
      - label: "REAL" or "FAKE" (adjust mapping if your model differs)
      - confidence: float in [0, 1]
    """
    model = _get_model()
    x = _preprocess_image(image_path)

    with torch.no_grad():
        logits = model(x)

        # Handle both:
        # - binary sigmoid output shape [1] or [1,1]
        # - 2-class softmax output shape [1,2]
        if isinstance(logits, (tuple, list)):
            logits = logits[0]

        if logits.ndim == 2 and logits.shape[1] == 2:
            probs = torch.softmax(logits, dim=1)[0]
            # assume index 1 = REAL, index 0 = FAKE 
            real_prob = float(probs[1].item())
        else:
            # assume sigmoid probability of REAL
            real_prob = float(torch.sigmoid(logits).view(-1)[0].item())

    label = "REAL" if real_prob >= 0.5 else "FAKE"
    confidence = real_prob if label == "REAL" else (1.0 - real_prob)

    return ImageInferenceResult(label=label, confidence=confidence)


def as_dict(res: ImageInferenceResult) -> dict:
    return {"label": res.label, "confidence": float(res.confidence)}