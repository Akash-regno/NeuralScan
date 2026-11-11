import json
import logging
from pathlib import Path
from typing import Any, Dict

logger = logging.getLogger("neuralscan.evaluation")

EVALUATION_FILE = Path(__file__).resolve().parent.parent / "evaluation_results.json"


def get_evaluation_results() -> Dict[str, Any]:
    """
    Loads and serves the test-set benchmark evaluation results,
    including metrics, confusion matrices, agreement matrices, and error breakdown.
    """
    if not EVALUATION_FILE.exists():
        logger.warning(f"Evaluation file not found at {EVALUATION_FILE}")
        return {"error": "Evaluation results not found."}

    try:
        with open(EVALUATION_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        logger.error(f"Error loading evaluation results: {e}", exc_info=True)
        return {"error": f"Failed to parse evaluation results: {str(e)}"}
