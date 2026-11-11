from collections import Counter
from typing import Dict, List, Tuple
import numpy as np
from app.config import (
    CLASS_NAMES,
    ENSEMBLE_WEIGHTS,
    MODEL_NAMES,
)


def compute_weighted_consensus(
    model_probabilities: Dict[str, np.ndarray],
    weights: Dict[str, float] = ENSEMBLE_WEIGHTS,
) -> np.ndarray:
    """
    Computes the validation-weighted probability ensemble:
    P_final(C) = w1 * P_resnet(C) + w2 * P_densenet(C) + w3 * P_efficientnet(C)
    where sum(w_i) == 1.0.
    Returns normalized consensus probability array of shape (4,).
    """
    consensus_probs = np.zeros(len(CLASS_NAMES), dtype=np.float32)

    total_weight = sum(weights.get(k, 1.0 / len(model_probabilities)) for k in model_probabilities)

    for model_key, probs in model_probabilities.items():
        w = weights.get(model_key, 1.0 / len(model_probabilities)) / total_weight
        consensus_probs += w * probs

    # Ensure strictly normalized
    sum_p = np.sum(consensus_probs)
    if sum_p > 0:
        consensus_probs = consensus_probs / sum_p

    return consensus_probs


def evaluate_model_agreement(
    model_predictions: Dict[str, str]
) -> Tuple[int, str, Dict[str, int], bool, List[str]]:
    """
    Evaluates cross-model agreement and voting distribution.
    Returns:
        - agreement_count: max votes for any class (1, 2, or 3)
        - agreement_tier: 'Strong agreement', 'Partial agreement', or 'Strong disagreement'
        - vote_counts: {class_name: count}
        - disagreement_detected: bool (True if not all 3 models agreed)
        - differing_models: list of model names that did not match the majority prediction
    """
    votes = list(model_predictions.values())
    counter = Counter(votes)
    most_common_class, max_votes = counter.most_common(1)[0]

    if max_votes == 3:
        tier = "Strong agreement"
        disagreement = False
    elif max_votes == 2:
        tier = "Partial agreement"
        disagreement = True
    else:
        tier = "Strong disagreement"
        disagreement = True

    # Identify which models differed from the consensus / majority
    differing_models = [
        MODEL_NAMES.get(m_key, m_key)
        for m_key, pred in model_predictions.items()
        if pred != most_common_class
    ]

    vote_distribution = {cls_name: counter.get(cls_name, 0) for cls_name in CLASS_NAMES}

    return max_votes, tier, vote_distribution, disagreement, differing_models


def build_consensus_result(
    model_probabilities: Dict[str, np.ndarray],
    weights: Dict[str, float] = ENSEMBLE_WEIGHTS,
) -> Dict[str, any]:
    """
    Orchestrates consensus computation and returns transparent ensemble metrics.
    """
    # 1. Determine individual argmax predictions
    model_predictions: Dict[str, str] = {}
    model_confidences: Dict[str, float] = {}

    for key, probs in model_probabilities.items():
        idx = int(np.argmax(probs))
        model_predictions[key] = CLASS_NAMES[idx]
        model_confidences[key] = float(probs[idx])

    # 2. Compute weighted consensus probabilities
    consensus_probs = compute_weighted_consensus(model_probabilities, weights)

    # 3. Determine final ensemble prediction
    final_idx = int(np.argmax(consensus_probs))
    final_prediction = CLASS_NAMES[final_idx]
    final_probability = round(float(consensus_probs[final_idx]), 4)

    # 4. Evaluate agreement
    agreement_count, tier, vote_counts, disagreement, differing_models = evaluate_model_agreement(
        model_predictions
    )

    # 5. Format consensus probabilities dictionary
    consensus_dict = {
        CLASS_NAMES[i]: round(float(consensus_probs[i]), 4)
        for i in range(len(CLASS_NAMES))
    }

    return {
        "final_prediction": final_prediction,
        "final_probability": final_probability,
        "consensus_probabilities_array": consensus_probs,
        "consensus_probabilities": consensus_dict,
        "model_agreement": agreement_count,
        "total_models": len(model_probabilities),
        "agreement_tier": tier,
        "disagreement_detected": disagreement,
        "differing_models": differing_models,
        "vote_counts": vote_counts,
        "weights_used": weights,
    }
