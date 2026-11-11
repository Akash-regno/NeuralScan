from typing import Dict, List, Tuple
import numpy as np
from app.config import (
    CLASS_NAMES,
    ENTROPY_LOW_THRESHOLD,
    ENTROPY_HIGH_THRESHOLD,
)


def calculate_entropy(probs: np.ndarray, epsilon: float = 1e-12) -> float:
    """
    Computes Shannon predictive entropy in bits:
    H(p) = -sum(p_i * log2(p_i + epsilon))
    Theoretical range for 4 classes: 0.0 bits (certainty) to 2.0 bits (uniform uncertainty).
    """
    clipped = np.clip(probs, epsilon, 1.0)
    # Re-normalize just in case
    clipped = clipped / np.sum(clipped)
    entropy = -float(np.sum(clipped * np.log2(clipped)))
    return round(max(0.0, entropy), 4)


def calculate_probability_variance(model_probs: Dict[str, np.ndarray]) -> Dict[str, float]:
    """
    Computes the inter-model variance for each class probability.
    High variance indicates the models disagree on that pathology's likelihood.
    """
    # Stack shape: (3, 4)
    matrix = np.stack(list(model_probs.values()), axis=0)
    variance_per_class = np.var(matrix, axis=0)

    return {
        CLASS_NAMES[i]: round(float(variance_per_class[i]), 5)
        for i in range(len(CLASS_NAMES))
    }


def analyze_uncertainty(
    model_probs: Dict[str, np.ndarray],
    consensus_probs: np.ndarray,
    model_agreement: int,
) -> Dict[str, any]:
    """
    Conducts comprehensive uncertainty analysis across all models and consensus.
    Returns:
        - entropy: consensus distribution entropy
        - model_entropies: individual entropy per model
        - average_entropy: mean entropy across models
        - class_variance: inter-model variance for each class
        - mean_variance: average inter-model probability variance
        - level: 'low', 'moderate', or 'high'
        - level_label: 'LOW UNCERTAINTY', 'MODERATE UNCERTAINTY', 'HIGH UNCERTAINTY'
        - hard_case: bool (True if ambiguous/high uncertainty)
        - reasoning: transparent explanation of the uncertainty categorization
    """
    # 1. Calculate individual model entropies
    model_entropies = {
        model_name: calculate_entropy(probs)
        for model_name, probs in model_probs.items()
    }
    avg_entropy = round(float(np.mean(list(model_entropies.values()))), 4)
    consensus_entropy = calculate_entropy(consensus_probs)

    # 2. Calculate inter-model probability variance
    class_variance = calculate_probability_variance(model_probs)
    mean_variance = round(float(np.mean(list(class_variance.values()))), 5)

    # 3. Categorize uncertainty level
    # Factors: consensus entropy, model agreement, inter-model variance
    if consensus_entropy < ENTROPY_LOW_THRESHOLD and model_agreement == 3 and mean_variance < 0.015:
        level = "low"
        level_label = "LOW UNCERTAINTY"
        reasoning = (
            f"All 3 models agree with high distribution sharpness (entropy: {consensus_entropy:.2f} bits, "
            f"inter-model variance: {mean_variance:.4f})."
        )
    elif consensus_entropy > ENTROPY_HIGH_THRESHOLD or model_agreement == 1 or mean_variance > 0.05:
        level = "high"
        level_label = "HIGH UNCERTAINTY"
        reasoning = (
            f"Substantial predictive dispersion detected (entropy: {consensus_entropy:.2f} bits, "
            f"agreement: {model_agreement}/3, variance: {mean_variance:.4f}). Case displays ambiguous visual indicators."
        )
    else:
        level = "moderate"
        level_label = "MODERATE UNCERTAINTY"
        reasoning = (
            f"Moderate dispersion between candidate classes (entropy: {consensus_entropy:.2f} bits, "
            f"agreement: {model_agreement}/3). Probability distribution warrants cross-model review."
        )

    # 4. Hard Case Detection (Section 35)
    # Flagged if high uncertainty, or top two probabilities differ by <= 10%, or 3-way disagreement
    sorted_probs = np.sort(consensus_probs)[::-1]
    top_diff = sorted_probs[0] - sorted_probs[1]
    is_hard_case = (
        level == "high" or
        top_diff <= 0.12 or
        model_agreement == 1
    )

    return {
        "level": level,
        "level_label": level_label,
        "entropy": consensus_entropy,
        "average_entropy": avg_entropy,
        "model_entropies": model_entropies,
        "class_variance": class_variance,
        "mean_variance": mean_variance,
        "hard_case": is_hard_case,
        "reasoning": reasoning,
    }
