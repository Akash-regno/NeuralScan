import time
from typing import Dict
import numpy as np
from app.config import (
    CLASS_NAMES,
    MODEL_NAMES,
    ENSEMBLE_WEIGHTS,
)
from app.preprocessing import preprocess_all_models
from app.models import get_multi_model_manager
from app.ensemble import build_consensus_result
from app.uncertainty import analyze_uncertainty, calculate_entropy
from app.schemas import (
    MultiModelPredictionResponse,
    ModelPredictionDetail,
    UncertaintyDetail,
)


def run_multi_model_prediction_pipeline(image_bytes: bytes) -> MultiModelPredictionResponse:
    """
    Orchestrates the complete Three-Model Consensus and Debate prediction pipeline:
    1. Preprocesses image independently for ResNet50, DenseNet121, and EfficientNetB0.
    2. Runs inference across all 3 deep learning models.
    3. Extracts 4-class probabilities for each model.
    4. Computes validation-weighted consensus probabilities.
    5. Calculates cross-model predictive entropy and uncertainty metrics.
    6. Identifies agreement/disagreement and differing models.
    7. Formats complete typed MultiModelPredictionResponse.
    """
    start_time = time.perf_counter()

    # 1. Architecture-specific preprocessing for all 3 models
    preprocessed_batches = preprocess_all_models(image_bytes)

    # 2. Multi-model inference
    model_mgr = get_multi_model_manager()
    raw_predictions: Dict[str, np.ndarray] = model_mgr.predict_all(preprocessed_batches)

    # 3. Compile individual model prediction details
    models_dict: Dict[str, ModelPredictionDetail] = {}

    for key, probs in raw_predictions.items():
        argmax_idx = int(np.argmax(probs))
        predicted_class = CLASS_NAMES[argmax_idx]
        confidence_val = round(float(probs[argmax_idx]), 4)
        entropy_val = calculate_entropy(probs)

        probs_dict = {
            CLASS_NAMES[i]: round(float(probs[i]), 4)
            for i in range(len(CLASS_NAMES))
        }

        models_dict[key] = ModelPredictionDetail(
            name=MODEL_NAMES.get(key, key),
            prediction=predicted_class,
            confidence=confidence_val,
            entropy=entropy_val,
            probabilities=probs_dict,
        )

    # 4. Weighted Consensus Engine
    consensus = build_consensus_result(raw_predictions, ENSEMBLE_WEIGHTS)

    # 5. Uncertainty Analysis
    uncertainty_data = analyze_uncertainty(
        model_probs=raw_predictions,
        consensus_probs=consensus["consensus_probabilities_array"],
        model_agreement=consensus["model_agreement"],
    )

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    return MultiModelPredictionResponse(
        success=True,
        final_prediction=consensus["final_prediction"],
        final_probability=consensus["final_probability"],
        model_agreement=consensus["model_agreement"],
        total_models=consensus["total_models"],
        agreement_tier=consensus["agreement_tier"],
        disagreement_detected=consensus["disagreement_detected"],
        differing_models=consensus["differing_models"],
        vote_counts=consensus["vote_counts"],
        models=models_dict,
        consensus_probabilities=consensus["consensus_probabilities"],
        uncertainty=UncertaintyDetail(
            level=uncertainty_data["level"],
            level_label=uncertainty_data["level_label"],
            entropy=uncertainty_data["entropy"],
            average_entropy=uncertainty_data["average_entropy"],
            class_variance=uncertainty_data["class_variance"],
            mean_variance=uncertainty_data["mean_variance"],
            hard_case=uncertainty_data["hard_case"],
            reasoning=uncertainty_data["reasoning"],
        ),
        ensemble_weights=ENSEMBLE_WEIGHTS,
        processing_time_ms=round(elapsed_ms, 1),
    )
