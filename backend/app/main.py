import logging
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import (
    ALLOWED_EXTENSIONS,
    ALLOWED_ORIGINS,
    MAX_FILE_SIZE_BYTES,
    ENSEMBLE_WEIGHTS,
)
from app.models import get_multi_model_manager
from app.prediction import run_multi_model_prediction_pipeline
from app.evaluation import get_evaluation_results
from app.schemas import (
    ErrorResponse,
    HealthResponse,
    MultiModelPredictionResponse,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("neuralscan.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load all three deep-learning models ONCE upon application startup:
    - Model 1: ResNet50
    - Model 2: DenseNet121
    - Model 3: EfficientNetB0
    Models remain in memory and are never reloaded per request.
    """
    logger.info("Initializing NeuralScan Three-Model AI Consensus Engine...")
    manager = get_multi_model_manager()
    try:
        manager.load_all_models()
        logger.info("Three-Model Consensus Engine initialized successfully.")
    except Exception as e:
        logger.error(f"Error during model initialization: {e}")
    yield
    logger.info("Shutting down NeuralScan AI backend.")


app = FastAPI(
    title="NeuralScan 2.0 API - Three-Model AI Consensus & Debate System",
    description="Multi-model thoracic radiograph consensus discrimination (ResNet50 + DenseNet121 + EfficientNetB0). Academic/Research Prototype.",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
async def root():
    return {
        "name": "NeuralScan 2.0 API",
        "tagline": "Three-Model AI Consensus and Debate System",
        "models": ["ResNet50", "DenseNet121", "EfficientNetB0"],
        "status": "online",
        "disclaimer": "Academic/Research prototype. Not a medical diagnostic device.",
        "docs": "/docs",
    }


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["System"],
)
async def health_check():
    """
    Health check endpoint reporting readiness of all three models.
    """
    manager = get_multi_model_manager()
    status_summary = manager.get_status_summary()
    all_ready = manager.is_all_loaded()

    return HealthResponse(
        status="ok" if all_ready else "degraded",
        models=status_summary,
    )


@app.get(
    "/api/models/evaluation",
    tags=["Research & Benchmarks"],
)
async def get_model_benchmarks():
    """
    Returns empirical test-set evaluation results across all three models and ensemble:
    - Overall accuracy, precision, recall, macro F1, test loss
    - Per-class metrics
    - 4 Confusion Matrices
    - Pairwise Model Agreement Matrix
    - Error Analysis breakdown
    - Model Calibration metrics
    """
    results = get_evaluation_results()
    if "error" in results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=results["error"]
        )
    return results


@app.get(
    "/api/models/weights",
    tags=["Research & Benchmarks"],
)
async def get_ensemble_weights():
    """
    Returns the validation-derived ensemble weights used for weighted probability consensus.
    """
    return {
        "weights": ENSEMBLE_WEIGHTS,
        "strategy": "Normalized validation Macro-F1 (leakage-safe, untouched test set)",
        "sum": sum(ENSEMBLE_WEIGHTS.values()),
    }


@app.post(
    "/api/predict",
    response_model=MultiModelPredictionResponse,
    responses={
        400: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
    tags=["Consensus Classification"],
)
async def predict_xray(file: UploadFile = File(...)):
    """
    Analyzes an uploaded chest X-ray using the Three-Model Consensus Pipeline:
    1. ResNet50 (224x224)
    2. DenseNet121 (224x224)
    3. EfficientNetB0 (224x224)
    
    Computes:
    - 4-class probabilities for each model
    - Weighted probability consensus
    - Predictive entropy & uncertainty level (Low, Moderate, High)
    - Agreement count & disagreement detection
    - Ambiguous Hard Case detection
    """
    # 1. Filename validation
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file selected. Please upload a chest X-ray image.",
        )

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a valid JPG, JPEG, or PNG image.",
        )

    # 2. Read bytes into memory & check size
    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Error reading uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read uploaded file.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10 MB limit.",
        )

    # 3. Verify models status
    manager = get_multi_model_manager()
    if not manager.is_all_loaded():
        logger.warning("Predict invoked but not all models are loaded. Attempting on-demand load...")
        manager.load_all_models()
        if not manager.is_all_loaded():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="One or more AI models are initializing or unavailable.",
            )

    # 4. Execute 3-model prediction pipeline
    try:
        result = run_multi_model_prediction_pipeline(image_bytes)
        return result
    except ValueError as ve:
        logger.warning(f"Preprocessing validation failed: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to analyze this image. Please ensure it is a valid chest X-ray file.",
        )
    except Exception as e:
        logger.error(f"Inference execution failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing consensus inference: {str(e)}",
        )


# Global Exception Handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"success": False, "error": "An unexpected server error occurred."},
    )
