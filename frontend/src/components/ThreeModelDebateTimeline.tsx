import React, { useEffect, useState } from 'react';
import { Cpu, Eye, GitMerge, CheckCircle } from 'lucide-react';

interface TimelineProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
}

const STEPS = [
  { id: 1, label: 'ResNet50', desc: 'Feature Extraction (224x224 BGR)', icon: Cpu },
  { id: 2, label: 'DenseNet121', desc: 'Densely Connected Re-use', icon: Eye },
  { id: 3, label: 'EfficientNetB0', desc: 'Compound Scaled Inference', icon: Cpu },
  { id: 4, label: 'Cross-Model Compare', desc: 'Probability Dispersion & Variance', icon: GitMerge },
  { id: 5, label: 'Consensus Engine', desc: 'Validation-Weighted Probability', icon: GitMerge },
  { id: 6, label: 'Final Output', desc: 'Transparent Consensus & Uncertainty', icon: CheckCircle },
];

export const ThreeModelDebateTimeline: React.FC<TimelineProps> = ({ isAnalyzing }) => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isAnalyzing) {
      setActiveStep(6);
      return;
    }

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < 6 ? prev + 1 : 1));
    }, 450);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className="w-full bg-slate-900/60 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-xl mb-6 select-none shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {isAnalyzing && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAnalyzing ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            {isAnalyzing ? 'Analysis Pipeline Executing...' : 'Three-Model Consensus Verified'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Step {activeStep} of 6
        </span>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {STEPS.map((s) => {
          const Icon = s.icon;
          const isDone = activeStep > s.id || !isAnalyzing;
          const isCurrent = activeStep === s.id && isAnalyzing;

          return (
            <div
              key={s.id}
              className={`relative p-2.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-red-950/60 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.3)] scale-[1.02]'
                  : isDone
                  ? 'bg-black/50 border-emerald-500/30 text-slate-300'
                  : 'bg-black/20 border-white/5 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5">
                  0{s.id}
                </span>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isCurrent
                      ? 'text-red-400 animate-pulse'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`}
                />
              </div>
              <div>
                <div className={`text-xs font-bold truncate ${isCurrent ? 'text-red-200' : isDone ? 'text-white' : 'text-slate-500'}`}>
                  {s.label}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreeModelDebateTimeline;
