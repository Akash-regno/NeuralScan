import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { PredictionProbabilities, ModelPredictionDetail } from '../types';

interface GroupedChartProps {
  models: {
    resnet50: ModelPredictionDetail;
    densenet121: ModelPredictionDetail;
    efficientnetb0: ModelPredictionDetail;
    [key: string]: ModelPredictionDetail;
  };
  consensusProbabilities: PredictionProbabilities;
}

const SERIES = [
  { key: 'resnet50', label: 'ResNet50', color: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-400' },
  { key: 'densenet121', label: 'DenseNet121', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-400' },
  { key: 'efficientnetb0', label: 'EfficientNetB0', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-400' },
  { key: 'consensus', label: 'Consensus Ensemble', color: 'bg-gradient-to-t from-red-600 to-red-400', text: 'text-red-400', border: 'border-red-400' },
];

const CLASSES = ['Covid', 'Tuberculosis', 'Normal', 'Pneumonia'];

export const GroupedProbabilityChart: React.FC<GroupedChartProps> = ({
  models,
  consensusProbabilities,
}) => {
  const [hoveredBar, setHoveredBar] = useState<{ cls: string; series: string; val: number } | null>(null);

  const getVal = (seriesKey: string, cls: string): number => {
    if (seriesKey === 'consensus') {
      return consensusProbabilities[cls] || 0;
    }
    return models[seriesKey]?.probabilities[cls] || 0;
  };

  return (
    <div className="w-full p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-500" />
            Grouped Probability Comparison (4 Classes × 4 Estimators)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Direct side-by-side comparison of individual model posterior probabilities and the resulting weighted consensus.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {SERIES.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className={`w-3 h-3 rounded-sm ${s.color}`} />
              <span className="font-mono text-[11px]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grouped Bar Chart Area */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-2">
        {CLASSES.map((cls) => {
          return (
            <div
              key={cls}
              className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between"
            >
              {/* Class Header */}
              <div className="text-center pb-3 border-b border-white/5 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {cls}
                </span>
              </div>

              {/* 4 Bars grouped together */}
              <div className="h-44 flex items-end justify-center gap-1.5 sm:gap-2 px-1 relative">
                {SERIES.map((s) => {
                  const val = getVal(s.key, cls);
                  const heightPercent = Math.max(3, val * 100);
                  const isHovered =
                    hoveredBar?.cls === cls && hoveredBar?.series === s.key;

                  return (
                    <div
                      key={s.key}
                      onMouseEnter={() => setHoveredBar({ cls, series: s.label, val })}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="flex-1 max-w-[28px] h-full flex flex-col items-center justify-end group cursor-pointer relative"
                    >
                      {/* Floating tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 z-20 px-2 py-1 rounded bg-black/90 border border-white/20 text-[10px] font-mono text-white whitespace-nowrap shadow-lg">
                          {s.label}: {(val * 100).toFixed(1)}%
                        </div>
                      )}

                      {/* Percentage on top of bar */}
                      <span className="text-[9px] font-mono text-slate-400 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-white">
                        {(val * 100).toFixed(0)}%
                      </span>

                      {/* Bar Fill */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md ${s.color} transition-all duration-500 group-hover:brightness-125 ${
                          isHovered ? 'ring-2 ring-white/50' : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Class Summary footer */}
              <div className="mt-3 pt-2 border-t border-white/5 text-center">
                <span className="text-[10px] font-mono text-slate-400">
                  Consensus: <strong className="text-rose-300">{(getVal('consensus', cls) * 100).toFixed(1)}%</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupedProbabilityChart;
