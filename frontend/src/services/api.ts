import type {
  HealthResponse,
  MultiModelPredictionResponse,
  EvaluationResults,
} from '../types';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';

/**
 * Checks backend health status and readiness of all three models
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        status: 'error',
        detail: errData.error || errData.detail || 'Service unavailable',
      };
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Backend unreachable';
    return {
      status: 'error',
      detail: message,
    };
  }
}

/**
 * Uploads a chest X-ray image to the Three-Model Consensus Engine:
 * Analyzes across ResNet50, DenseNet121, and EfficientNetB0 simultaneously.
 */
export async function predictXray(file: File): Promise<MultiModelPredictionResponse> {
  // Client-side validation
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));

  if (!hasValidExt) {
    throw new Error('Please upload a valid JPG, JPEG, or PNG image.');
  }

  const MAX_SIZE_MB = 10;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error('File size exceeds the 10 MB limit. Please select a smaller image.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const controller = new AbortController();
    // 40s timeout for 3-model neural inference
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = 'Unable to analyze this image.';
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
        else if (errorData.detail) errorMsg = errorData.detail;
      } catch {
        // Fallback for non-JSON error
      }

      if (response.status === 503) {
        throw new Error('NeuralScan consensus engine is initializing or unavailable. Please try again in a few moments.');
      }
      throw new Error(errorMsg);
    }

    const data: MultiModelPredictionResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('Consensus analysis timed out. Please try again.');
      }
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        throw new Error('NeuralScan backend is unavailable. Please verify that the server is running on port 8000.');
      }
      throw err;
    }
    throw new Error('An unexpected error occurred while analyzing the image across the three models.');
  }
}

/**
 * Fetches untouched test-set benchmark evaluation metrics across all three models and ensemble
 */
export async function fetchModelEvaluation(): Promise<EvaluationResults> {
  const response = await fetch(`${API_BASE_URL}/api/models/evaluation`);
  if (!response.ok) {
    throw new Error('Failed to load model evaluation benchmarks.');
  }
  return await response.json();
}

/**
 * Fetches validation-derived ensemble weights
 */
export async function fetchModelWeights(): Promise<{ weights: Record<string, number>; strategy: string }> {
  const response = await fetch(`${API_BASE_URL}/api/models/weights`);
  if (!response.ok) {
    throw new Error('Failed to load ensemble weights.');
  }
  return await response.json();
}
