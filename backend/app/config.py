import os
from pathlib import Path
from typing import Dict, List

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# 1. THREE-MODEL ARCHITECTURE PATHS
# Model 1: ResNet50
DEFAULT_RESNET_PATH = MODELS_DIR / "chest_xray_resnet50_final.keras"
RESNET50_PATH = Path(os.getenv("RESNET50_PATH", str(DEFAULT_RESNET_PATH)))
if not RESNET50_PATH.exists():
    fallback = Path("chest_xray_resnet50_final.keras")
    if fallback.exists():
        RESNET50_PATH = fallback.resolve()

# Model 2: DenseNet121
DEFAULT_DENSENET_PATH = MODELS_DIR / "densenet121_final.keras"
DENSENET121_PATH = Path(os.getenv("DENSENET121_PATH", str(DEFAULT_DENSENET_PATH)))
if not DENSENET121_PATH.exists():
    alt_dense = MODELS_DIR / "chest_xray_densenet121_final.keras"
    if alt_dense.exists():
        DENSENET121_PATH = alt_dense.resolve()

# Model 3: EfficientNetB0
DEFAULT_EFFICIENTNET_PATH = MODELS_DIR / "efficientnetb0_final.keras"
EFFICIENTNETB0_PATH = Path(os.getenv("EFFICIENTNETB0_PATH", str(DEFAULT_EFFICIENTNET_PATH)))
if not EFFICIENTNETB0_PATH.exists():
    alt_eff = MODELS_DIR / "chest_xray_efficientnetb0_final.keras"
    if alt_eff.exists():
        EFFICIENTNETB0_PATH = alt_eff.resolve()

# Model Names
MODEL_NAMES = {
    "resnet50": "ResNet50",
    "densenet121": "DenseNet121",
    "efficientnetb0": "EfficientNetB0"
}

INPUT_SIZE = (224, 224)
INPUT_SIZE_STR = "224x224"

# STRICT CLASS ORDER - NEVER CHANGE
# 0 = Covid, 1 = Tuberculosis, 2 = Normal, 3 = Pneumonia
CLASS_NAMES: List[str] = [
    "Covid",
    "Tuberculosis",
    "Normal",
    "Pneumonia"
]

# 12. WEIGHTED CONSENSUS CONFIGURATION
# Normalized weights derived from validation Macro-F1 scores (w1 + w2 + w3 = 1.0)
# ResNet50 val Macro-F1: ~0.942 -> normalized 0.34
# DenseNet121 val Macro-F1: ~0.938 -> normalized 0.33
# EfficientNetB0 val Macro-F1: ~0.936 -> normalized 0.33
ENSEMBLE_WEIGHTS: Dict[str, float] = {
    "resnet50": 0.34,
    "densenet121": 0.33,
    "efficientnetb0": 0.33
}

# 16. UNCERTAINTY THRESHOLDS (Predictive Entropy in bits: H(p) = -sum(p * log2(p)))
# Maximum theoretical 4-class entropy is log2(4) = 2.0 bits (uniform distribution)
ENTROPY_LOW_THRESHOLD = 0.65       # High confidence prediction
ENTROPY_HIGH_THRESHOLD = 1.15      # High uncertainty / ambiguous case

# File upload limits & security
MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/pjpeg"}

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "*"
]
