import React from 'react';
import { Cpu, Eye, Zap, Layers, ArrowDown } from 'lucide-react';
import type { ModelPredictionDetail, ClassName } from '../types';

interface ThreeModelCardsProps {
  models: {
    resnet50: ModelPredictionDetail;
    densenet121: ModelPredictionDetail;
    efficientnetb0: ModelPredictionDetail;
    [key: string]: ModelPredictionDetail;
  };
  weights: Record<string, number>;
  consensusPrediction: string;
}

const MODEL_SPECS = {
  resnet50: {
    name: 'ResNet50',
    tagline: 'Deep Residual Network',
    arch: '50 Residual Layers',
    params: '25.6M params',
    icon: Layers,
    color: 'rose',
    border: 'border-rose-500/40',
    bg: 'from-rose-950/40 via-slate-900/60 to-black/80',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  },
  densenet121: {
    name: 'DenseNet121',
    tagline: 'Densely Connected CNN',
    arch: '121 Dense Layers',
    params: '8.0M params',
    icon: Eye,
    color: 'blue',
    border: 'border-blue-500/40',
    bg: 'from-blue-950/40 via-slate-900/60 to-black/80',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    badge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  },
  efficientnetb0: {
    name: 'EfficientNetB0',
    tagline: 'Compound Scaled CNN',
    arch: 'B0 Scaling Depth/Width',
    params: '5.3M params',
    icon: Zap,
    color: 'emerald',
    border: 'border-emerald-500/40',
    bg: 'from-emerald-950/40 via-slate-900/60 to-black/80',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
};

const CLASS_COLORS: Record<string, { text: string; bg: string; bar: string }> = {
  Covid: { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', bar: 'bg-rose-500' },
  Tuberculosis: { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', bar: 'bg-amber-500' },
  Normal: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', bar: 'bg-emerald-500' },
  Pneumonia: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', bar: 'bg-blue-500' },
};

export const ThreeModelCards: React.FC<ThreeModelCardsProps> = ({
  models,
  weights,
  consensusPrediction,
}) => {
  const modelKeys = ['resnet50', 'densenet121', 'efficientnetb0'];

  return (
    <div className="w-full space-y-6">
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-500" />
            Three Independent Neural Observers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Each architecture evaluates the identical radiograph using separate feature extraction and preprocessing pipelines.
          </p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          Parallel 3-Model Inference
        </span>
      </div>

      {/* 3 MODEL CARDS (DESKTOP: 3 COLUMNS, TABLET: 2+1, MOBILE: STACKED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modelKeys.map((key) => {
          const detail = models[key];
          const spec = MODEL_SPECS[key as keyof typeof MODEL_SPECS];
          if (!detail || !spec) return null;

          const Icon = spec.icon;
          const isConsensusWinner = detail.prediction === consensusPrediction;
          const weightPercent = Math.round((weights[key] || 0.33) * 100);
          const colorClass = CLASS_COLORS[detail.prediction] || CLASS_COLORS.Covid;

          return (
            <div
              key={key}
              className={`relative rounded-2xl border ${spec.border} bg-gradient-to-b ${spec.bg} ${spec.glow} p-5 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]`}
            >
              <div>
                {/* Top Row: Model Name & Arch Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base leading-tight">
                          {spec.name}
                        </h4>
                        {isConsensusWinner && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Winner
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {spec.tagline}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${spec.badge}`}>
                    {weightPercent}% Wt
                  </span>
                </div>

                {/* Primary Prediction Box */}
                <div className={`my-4 p-3.5 rounded-xl border ${colorClass.bg} flex items-center justify-between`}>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      Top Call
                    </span>
                    <span className={`text-xl font-extrabold tracking-tight ${colorClass.text}`}>
                      {detail.prediction}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
                      Confidence
                    </span>
                    <span className="text-xl font-mono font-black text-white">
                      {(detail.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 4-Class Probability Distribution for this Model */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Softmax Distribution
                  </span>
                  {(['Covid', 'Tuberculosis', 'Normal', 'Pneumonia'] as ClassName[]).map((cls) => {
                    const prob = detail.probabilities[cls] || 0;
                    const pct = (prob * 100).toFixed(1);
                    const isTop = cls === detail.prediction;
                    const c = CLASS_COLORS[cls];

                    return (
                      <div key={cls} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className={isTop ? 'text-white font-bold' : 'text-slate-400'}>
                            {cls}
                          </span>
                          <span className={isTop ? `${c.text} font-bold` : 'text-slate-400'}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card Footer: Entropy & Diagnostics */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Entropy: <strong className="text-slate-200">{detail.entropy.toFixed(3)} bits</strong></span>
                <span>Preproc: 224x224 RGB</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* VISUAL ARROW LEADING INTO CONSENSUS */}
      <div className="flex flex-col items-center justify-center pt-2 select-none">
        <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-400">
          <span className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent to-red-500/50" />
          <span className="flex items-center gap-1.5 text-red-400 font-bold">
            <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
            Convergence into Consensus Engine
          </span>
          <span className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent to-red-500/50" />
        </div>
      </div>
    </div>
  );
};

export default ThreeModelCards;
