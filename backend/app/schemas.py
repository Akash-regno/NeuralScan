from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class HealthModelStatus(BaseModel):
    name: str
    loaded: bool
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    models: Dict[str, HealthModelStatus]


class ModelPredictionDetail(BaseModel):
    name: str = Field(..., example="ResNet50")
    prediction: str = Field(..., example="Covid")
    confidence: float = Field(..., example=0.912)
    entropy: float = Field(..., example=0.34)
    probabilities: Dict[str, float] = Field(
        ...,
        example={
            "Covid": 0.912,
            "Tuberculosis": 0.021,
            "Normal": 0.035,
            "Pneumonia": 0.032,
        },
    )


class UncertaintyDetail(BaseModel):
    level: str = Field(..., example="low")
    level_label: str = Field(..., example="LOW UNCERTAINTY")
    entropy: float = Field(..., example=0.21)
    average_entropy: float = Field(..., example=0.25)
    class_variance: Dict[str, float]
    mean_variance: float = Field(..., example=0.003)
    hard_case: bool = Field(False, example=False)
    reasoning: str


class MultiModelPredictionResponse(BaseModel):
    success: bool = Field(True, example=True)
    final_prediction: str = Field(..., example="Covid")
    final_probability: float = Field(..., example=0.914)
    model_agreement: int = Field(..., example=3)
    total_models: int = Field(3, example=3)
    agreement_tier: str = Field(..., example="Strong agreement")
    disagreement_detected: bool = Field(False, example=False)
    differing_models: List[str] = Field(default_factory=list)
    vote_counts: Dict[str, int] = Field(
        default_factory=dict,
        example={"Covid": 3, "Tuberculosis": 0, "Normal": 0, "Pneumonia": 0},
    )
    models: Dict[str, ModelPredictionDetail]
    consensus_probabilities: Dict[str, float] = Field(
        ...,
        example={
            "Covid": 0.914,
            "Tuberculosis": 0.025,
            "Normal": 0.028,
            "Pneumonia": 0.033,
        },
    )
    uncertainty: UncertaintyDetail
    ensemble_weights: Dict[str, float] = Field(
        default_factory=dict,
        example={"resnet50": 0.34, "densenet121": 0.33, "efficientnetb0": 0.33},
    )
    processing_time_ms: float = Field(..., example=842.1)


class ErrorResponse(BaseModel):
    success: bool = Field(False, example=False)
    error: str = Field(..., example="Invalid file format.")
