import logging
from typing import Dict, Optional
import numpy as np
import tensorflow as tf
from app.config import (
    RESNET50_PATH,
    DENSENET121_PATH,
    EFFICIENTNETB0_PATH,
    MODEL_NAMES,
)

logger = logging.getLogger("neuralscan.models")


class MultiModelManager:
    _instance: Optional["MultiModelManager"] = None

    def __init__(self):
        self.models: Dict[str, Optional[tf.keras.Model]] = {
            "resnet50": None,
            "densenet121": None,
            "efficientnetb0": None,
        }
        self.load_errors: Dict[str, Optional[str]] = {
            "resnet50": None,
            "densenet121": None,
            "efficientnetb0": None,
        }

    @classmethod
    def get_instance(cls) -> "MultiModelManager":
        if cls._instance is None:
            cls._instance = MultiModelManager()
        return cls._instance

    def load_all_models(self) -> None:
        """
        Loads all three models into memory ONCE during application startup.
        - Model 1: ResNet50
        - Model 2: DenseNet121
        - Model 3: EfficientNetB0
        Performs warm-up inference on dummy tensors to eliminate first-request latency.
        """
        logger.info("Initializing Three-Model Consensus Engine...")

        model_configs = [
            ("resnet50", RESNET50_PATH, MODEL_NAMES["resnet50"]),
            ("densenet121", DENSENET121_PATH, MODEL_NAMES["densenet121"]),
            ("efficientnetb0", EFFICIENTNETB0_PATH, MODEL_NAMES["efficientnetb0"]),
        ]

        dummy_batch = np.zeros((1, 224, 224, 3), dtype=np.float32)

        for key, path, display_name in model_configs:
            if self.models[key] is not None:
                logger.info(f"{display_name} already loaded.")
                continue

            resolved_path = str(path)
            logger.info(f"Loading {display_name} from: {resolved_path}")

            try:
                if not path.exists():
                    raise FileNotFoundError(
                        f"Model file not found at '{resolved_path}'. "
                        f"Please ensure {path.name} is placed in backend/models/"
                    )

                loaded_model = tf.keras.models.load_model(resolved_path)
                self.models[key] = loaded_model
                self.load_errors[key] = None
                logger.info(
                    f"Successfully loaded {display_name}. "
                    f"Input: {loaded_model.input_shape}, Output: {loaded_model.output_shape}"
                )

                # Warmup inference
                _ = loaded_model.predict(dummy_batch, verbose=0)
                logger.info(f"{display_name} warmup completed.")

            except Exception as e:
                self.models[key] = None
                self.load_errors[key] = str(e)
                logger.error(f"Failed to load {display_name}: {e}", exc_info=True)

    def is_all_loaded(self) -> bool:
        """Returns True if all three models are loaded and ready."""
        return all(m is not None for m in self.models.values())

    def get_status_summary(self) -> Dict[str, Dict[str, any]]:
        """Returns status and diagnostics for all three models."""
        return {
            key: {
                "name": MODEL_NAMES[key],
                "loaded": self.models[key] is not None,
                "error": self.load_errors[key],
            }
            for key in self.models
        }

    def predict_single(self, model_key: str, preprocessed_batch: np.ndarray) -> np.ndarray:
        """
        Runs inference on a single model.
        Returns probabilities shape (4,).
        """
        model = self.models.get(model_key)
        if model is None:
            err = self.load_errors.get(model_key) or f"Model {model_key} is not loaded."
            raise RuntimeError(f"{MODEL_NAMES.get(model_key, model_key)} unavailable: {err}")

        preds = model.predict(preprocessed_batch, verbose=0)
        return preds[0]

    def predict_all(self, preprocessed_batches: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Executes inference across all three models with their respective preprocessed batches.
        Returns:
            {
                "resnet50": np.ndarray (4,),
                "densenet121": np.ndarray (4,),
                "efficientnetb0": np.ndarray (4,)
            }
        """
        results: Dict[str, np.ndarray] = {}
        for key in ["resnet50", "densenet121", "efficientnetb0"]:
            batch = preprocessed_batches[key]
            results[key] = self.predict_single(key, batch)
        return results


def get_multi_model_manager() -> MultiModelManager:
    return MultiModelManager.get_instance()
