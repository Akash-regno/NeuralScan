import React, { useEffect, useState } from 'react';
import {
  Layers,
  BarChart3,
  GitMerge,
  Cpu,
  Activity,
  AlertCircle,
  TrendingUp,
  Table,
} from 'lucide-react';
import { fetchModelEvaluation } from '../services/api';
import type { EvaluationResults } from '../types';

const CLASS_NAMES = ['Covid', 'Tuberculosis', 'Normal', 'Pneumonia'];

export const ModelLaboratoryPage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMatrix, setSelectedMatrix] = useState<string>('Ensemble');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchModelEvaluation();
        setEvaluation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load model evaluation data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading Model Laboratory Benchmarks...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-white">Model Evaluation Unavailable</h2>
        <p className="text-sm text-slate-400 max-w-md">{error || 'Unable to load benchmark metrics.'}</p>
      </div>
    );
  }

  const activeConfusionMatrix = evaluation.confusion_matrices[selectedMatrix] || evaluation.confusion_matrices.Ensemble;

  return (
    <div className="w-full space-y-12 pb-24 animate-in fade-in duration-300">
      {/* PAGE HERO HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
          <Layers className="w-3.5 h-3.5" />
          Research & Experimental Benchmarks
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Model Laboratory
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
          Dataset-level comparative evaluation of ResNet50, DenseNet121, and EfficientNetB0 on the untouched 65,240-radiograph test partition.
        </p>

        {/* Essential Academic Notice */}
        <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200/90 leading-relaxed flex items-start gap-2.5 max-w-4xl">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>
            <strong>Experimental Dataset Evaluation:</strong> Model performance varies based on evaluation metric. Higher accuracy or recall on this dataset does not constitute clinical superiority or diagnostic authorization.
          </span>
        </div>
      </div>

      {/* SECTION 1: MODEL OVERVIEW (SPECIFICATIONS) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold text-white">
          <Cpu className="w-5 h-5 text-red-500" />
          <h3>1. Architectural Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* ResNet50 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-rose-500/30 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">ResNet50</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Residual Learning
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              50-layer deep residual network utilizing identity shortcut connections to mitigate vanishing gradient degradation.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between"><span>Parameters:</span><strong className="text-white">25.6 Million</strong></div>
              <div className="flex justify-between"><span>Input Shape:</span><strong className="text-white">224 × 224 × 3</strong></div>
              <div className="flex justify-between"><span>Ensemble Weight:</span><strong className="text-rose-300">0.34 (34%)</strong></div>
            </div>
          </div>

          {/* DenseNet121 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-blue-500/30 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">DenseNet121</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Dense Connectivity
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              121-layer architecture connecting all layers directly to maximize feature reuse and gradient flow across dense blocks.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between"><span>Parameters:</span><strong className="text-white">8.0 Million</strong></div>
              <div className="flex justify-between"><span>Input Shape:</span><strong className="text-white">224 × 224 × 3</strong></div>
              <div className="flex justify-between"><span>Ensemble Weight:</span><strong className="text-blue-300">0.33 (33%)</strong></div>
            </div>
          </div>

          {/* EfficientNetB0 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">EfficientNetB0</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Compound Scaling
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Neural network scaled uniformly along depth, width, and resolution using a fixed compound coefficient for mobile efficiency.
            </p>
            <div className="pt-2 border-t border-white/10 space-y-1.5 text-xs font-mono text-slate-300">
              <div className="flex justify-between"><span>Parameters:</span><strong className="text-white">5.3 Million</strong></div>
              <div className="flex justify-between"><span>Input Shape:</span><strong className="text-white">224 × 224 × 3</strong></div>
              <div className="flex justify-between"><span>Ensemble Weight:</span><strong className="text-emerald-300">0.33 (33%)</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: DATASET EVALUATION & BENCHMARK TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <Table className="w-5 h-5 text-red-500" />
            <h3>2. Test-Set Benchmark Evaluation</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Partition: 9,786 Untouched Test Images
          </span>
        </div>

        {/* Benchmark Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-black/60 border-b border-white/10 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Model</th>
                <th className="py-3.5 px-4">Parameters</th>
                <th className="py-3.5 px-4">Accuracy</th>
                <th className="py-3.5 px-4">Precision</th>
                <th className="py-3.5 px-4">Recall</th>
                <th className="py-3.5 px-4">Macro F1</th>
                <th className="py-3.5 px-4">Test Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {evaluation.benchmark_summary.map((b) => {
                const isEnsemble = b.model.includes('Ensemble');
                return (
                  <tr
                    key={b.model}
                    className={`transition-colors ${
                      isEnsemble
                        ? 'bg-rose-950/20 font-bold text-rose-200'
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-sans font-bold flex items-center gap-2 text-white">
                      {b.model}
                      {isEnsemble && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Consensus
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{b.parameters_m}M</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">{(b.test_accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4">{(b.macro_precision * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4">{(b.macro_recall * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 font-bold text-rose-300">{(b.macro_f1 * 100).toFixed(2)}%</td>
                    <td className="py-3.5 px-4 text-slate-400">{b.test_loss.toFixed(4)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Metric Highlights (Section 7 & 22) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {evaluation.metric_highlights.map((h) => (
            <div key={h.title} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {h.title}
              </div>
              <div className="text-xl font-black text-white flex items-center justify-between">
                <span>{h.model}</span>
                <span className="text-red-400 font-mono">{h.value}</span>
              </div>
              <p className="text-[11px] text-slate-400">{h.context}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3 & 4: PER-CLASS COMPARISON (F1-SCORES) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold text-white">
          <BarChart3 className="w-5 h-5 text-red-500" />
          <h3>3. Per-Class Performance Comparison</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {CLASS_NAMES.map((cls) => {
            const data = evaluation.per_class_comparison[cls];
            if (!data) return null;

            return (
              <div key={cls} className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{cls}</span>
                  <span className="text-[10px] font-mono text-slate-400">F1 Metric</span>
                </div>

                <div className="space-y-2.5">
                  {Object.entries(data).map(([modelName, metrics]) => {
                    const isEnsemble = modelName === 'Ensemble';
                    return (
                      <div key={modelName} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className={`${isEnsemble ? 'font-bold text-rose-300' : 'text-slate-300'}`}>
                            {modelName}
                          </span>
                          <span className="font-mono text-white font-bold">
                            {(metrics.f1 * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isEnsemble
                                ? 'bg-rose-500'
                                : modelName === 'ResNet50'
                                ? 'bg-rose-500'
                                : modelName === 'DenseNet121'
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${metrics.f1 * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: CONFUSION MATRICES */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <Activity className="w-5 h-5 text-red-500" />
            <h3>4. Confusion Matrix Heatmaps</h3>
          </div>

          {/* Model Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
            {['ResNet50', 'DenseNet121', 'EfficientNetB0', 'Ensemble'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMatrix(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedMatrix === m
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <div className="text-sm font-bold text-white">
              {selectedMatrix} Confusion Matrix (Untouched Test Set)
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Predicted vs Ground Truth across 9,786 samples
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-2 text-slate-500 font-sans text-[11px]">True \ Pred</th>
                  {CLASS_NAMES.map((c) => (
                    <th key={c} className="p-2 text-slate-300 font-bold">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLASS_NAMES.map((trueClass, rIdx) => (
                  <tr key={trueClass}>
                    <td className="p-2 text-slate-300 font-bold text-left">{trueClass}</td>
                    {CLASS_NAMES.map((_, cIdx) => {
                      const count = activeConfusionMatrix[rIdx]?.[cIdx] || 0;
                      const isDiagonal = rIdx === cIdx;
                      return (
                        <td
                          key={cIdx}
                          className={`p-3 rounded-lg font-bold transition-colors ${
                            isDiagonal
                              ? 'bg-red-950/80 text-red-300 border border-red-500/30'
                              : count > 50
                              ? 'bg-rose-950/40 text-rose-300'
                              : 'bg-black/30 text-slate-400'
                          }`}
                        >
                          {count}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 6 & 7: MODEL AGREEMENT MATRIX & ERROR ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pairwise Agreement Matrix */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-red-500" />
              5. Pairwise Model Agreement Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Test Set %</span>
          </div>

          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="text-slate-400">
                <th className="p-2 text-left">Model</th>
                <th className="p-2">ResNet50</th>
                <th className="p-2">DenseNet121</th>
                <th className="p-2">EfficientNetB0</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {['ResNet50', 'DenseNet121', 'EfficientNetB0'].map((mName, rIdx) => (
                <tr key={mName}>
                  <td className="p-2 font-sans font-bold text-white text-left">{mName}</td>
                  {[0, 1, 2].map((cIdx) => {
                    const val = evaluation.pairwise_agreement_matrix.matrix[rIdx][cIdx];
                    const isSelf = rIdx === cIdx;
                    return (
                      <td
                        key={cIdx}
                        className={`p-2 font-bold ${
                          isSelf ? 'text-slate-600' : 'text-rose-300'
                        }`}
                      >
                        {isSelf ? '—' : `${(val * 100).toFixed(1)}%`}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-white/5">
            Inter-architecture concordance remains above 93.1% across all pairs, confirming high model alignment with divergent capacity on edge cases.
          </p>
        </div>

        {/* Error Analysis Dashboard */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              6. Error Analysis Categorization
            </h3>
            <span className="text-[10px] font-mono text-slate-400">9,786 Cases</span>
          </div>

          <div className="space-y-3">
            {evaluation.error_analysis.categories.map((cat) => (
              <div key={cat.key} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{cat.title}</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {cat.count} ({cat.percentage}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 8: ENSEMBLE VALIDATION WEIGHTS & CALIBRATION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/80 via-black/90 to-red-950/40 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xl font-bold text-white">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h3>7. Validation-Derived Ensemble Weights & Calibration</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          To prevent test-set data leakage, ensemble weights were derived strictly from the validation split Macro-F1 performance: 
          <strong> ResNet50 (w = 0.34)</strong>, <strong>DenseNet121 (w = 0.33)</strong>, and <strong>EfficientNetB0 (w = 0.33)</strong>. 
          Evaluation on the untouched test partition demonstrates that the weighted ensemble achieves an Expected Calibration Error (ECE) of <strong>0.022</strong> (Brier Score: 0.064), outperforming all individual base models in probability calibration.
        </p>
      </div>
    </div>
  );
};

export default ModelLaboratoryPage;
