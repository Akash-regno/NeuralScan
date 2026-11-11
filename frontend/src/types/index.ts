export type ClassName = 'Covid' | 'Tuberculosis' | 'Normal' | 'Pneumonia';

export interface PredictionProbabilities {
  Covid: number;
  Tuberculosis: number;
  Normal: number;
  Pneumonia: number;
  [key: string]: number;
}

export interface ModelPredictionDetail {
  name: string;
  prediction: ClassName | string;
  confidence: number;
  entropy: number;
  probabilities: PredictionProbabilities;
}

export interface UncertaintyDetail {
  level: 'low' | 'moderate' | 'high' | string;
  level_label: string;
  entropy: number;
  average_entropy: number;
  class_variance: Record<string, number>;
  mean_variance: number;
  hard_case: boolean;
  reasoning: string;
}

export interface MultiModelPredictionResponse {
  success: boolean;
  final_prediction: ClassName | string;
  final_probability: number;
  model_agreement: number;
  total_models: number;
  agreement_tier: 'Strong agreement' | 'Partial agreement' | 'Strong disagreement' | string;
  disagreement_detected: boolean;
  differing_models: string[];
  vote_counts: Record<string, number>;
  models: {
    resnet50: ModelPredictionDetail;
    densenet121: ModelPredictionDetail;
    efficientnetb0: ModelPredictionDetail;
    [key: string]: ModelPredictionDetail;
  };
  consensus_probabilities: PredictionProbabilities;
  uncertainty: UncertaintyDetail;
  ensemble_weights: Record<string, number>;
  processing_time_ms: number;
}

// Backward-compatible alias
export type PredictionResponse = MultiModelPredictionResponse;

export interface HealthModelStatus {
  name: string;
  loaded: boolean;
  error?: string | null;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error' | string;
  models?: Record<string, HealthModelStatus>;
  model?: string;
  detail?: string;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}

export interface SampleImage {
  id: string;
  name: string;
  tag: string;
  path: string;
  filename: string;
  description: string;
}

export type ConfidenceCategory = 'HIGH' | 'MODERATE' | 'LOW';

export interface ConfidenceTier {
  category: ConfidenceCategory;
  label: string;
  badgeClass: string;
  borderClass: string;
  textClass: string;
  bgClass: string;
  description: string;
}

// Model Laboratory & Research Benchmarking Types
export interface BenchmarkItem {
  model: string;
  architecture: string;
  parameters_m: number;
  input_size: string;
  test_accuracy: number;
  macro_precision: number;
  macro_recall: number;
  macro_f1: number;
  test_loss: number;
  validation_f1: number;
  ensemble_weight: number;
  strengths: string;
}

export interface MetricHighlight {
  title: string;
  model: string;
  value: string;
  context: string;
}

export interface ClassMetrics {
  precision: number;
  recall: number;
  f1: number;
}

export interface ErrorCategory {
  key: string;
  title: string;
  count: number;
  percentage: number;
  description: string;
}

export interface EvaluationResults {
  dataset: {
    name: string;
    total_raw_images: number;
    total_cleaned_images: number;
    cross_class_duplicates_removed: number;
    classes: string[];
    split_ratio: string;
    test_set_size: number;
    class_distribution_test: Record<string, number>;
  };
  benchmark_summary: BenchmarkItem[];
  metric_highlights: MetricHighlight[];
  per_class_comparison: Record<string, Record<string, ClassMetrics>>;
  confusion_matrices: Record<string, number[][]>;
  pairwise_agreement_matrix: {
    models: string[];
    matrix: number[][];
    per_class_agreement: Record<string, Record<string, number>>;
  };
  error_analysis: {
    total_test_samples: number;
    categories: ErrorCategory[];
  };
  calibration_analysis: {
    description: string;
    models: Record<string, { brier_score: number; ece: number; status: string }>;
  };
}
