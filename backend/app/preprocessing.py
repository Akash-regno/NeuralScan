import io
from typing import Dict
import numpy as np
from PIL import Image
import tensorflow as tf
from app.config import INPUT_SIZE


def load_and_resize_image(image_bytes: bytes) -> np.ndarray:
    """
    Decodes raw image bytes and prepares standard (1, 224, 224, 3) float32 RGB array.
    1. Open image using Pillow.
    2. Convert to RGB (handles RGBA, Grayscale, etc.).
    3. Resize to 224 x 224 using Bilinear interpolation.
    4. Convert to float32 NumPy array.
    5. Add batch dimension -> shape (1, 224, 224, 3).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image = image.resize(INPUT_SIZE, Image.Resampling.BILINEAR)
        image_array = np.asarray(image, dtype=np.float32)
        image_batch = np.expand_dims(image_array, axis=0)
        return image_batch
    except Exception as e:
        raise ValueError(f"Failed to decode or resize image: {str(e)}") from e


def preprocess_resnet50(image_batch: np.ndarray) -> np.ndarray:
    """
    Applies exact ResNet50 preprocessing:
    tf.keras.applications.resnet50.preprocess_input()
    Converts RGB to BGR and zeroes each color channel with respect to ImageNet dataset.
    """
    batch_copy = np.copy(image_batch)
    return tf.keras.applications.resnet50.preprocess_input(batch_copy)


def preprocess_densenet121(image_batch: np.ndarray) -> np.ndarray:
    """
    Applies exact DenseNet121 preprocessing:
    tf.keras.applications.densenet.preprocess_input()
    Scales pixels between 0 and 1, then applies ImageNet mean/std normalization.
    """
    batch_copy = np.copy(image_batch)
    return tf.keras.applications.densenet.preprocess_input(batch_copy)


def preprocess_efficientnetb0(image_batch: np.ndarray) -> np.ndarray:
    """
    Applies exact EfficientNetB0 preprocessing:
    tf.keras.applications.efficientnet.preprocess_input()
    Matches the exact preprocessing expected by TensorFlow's EfficientNet implementation.
    """
    batch_copy = np.copy(image_batch)
    return tf.keras.applications.efficientnet.preprocess_input(batch_copy)


def preprocess_all_models(image_bytes: bytes) -> Dict[str, np.ndarray]:
    """
    Generates model-specific preprocessed batches for all three architectures
    from the single uploaded image.
    Returns:
        {
            "resnet50": (1, 224, 224, 3) preprocessed batch,
            "densenet121": (1, 224, 224, 3) preprocessed batch,
            "efficientnetb0": (1, 224, 224, 3) preprocessed batch
        }
    """
    raw_batch = load_and_resize_image(image_bytes)

    return {
        "resnet50": preprocess_resnet50(raw_batch),
        "densenet121": preprocess_densenet121(raw_batch),
        "efficientnetb0": preprocess_efficientnetb0(raw_batch),
    }
