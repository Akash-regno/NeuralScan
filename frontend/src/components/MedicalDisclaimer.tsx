import { AlertTriangle, Info } from 'lucide-react';

interface MedicalDisclaimerProps {
  variant?: 'compact' | 'banner' | 'full';
  className?: string;
}

export const MedicalDisclaimer: React.FC<MedicalDisclaimerProps> = ({
  variant = 'banner',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs ${className}`}>
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-medium">
          AI-generated research output — not a medical diagnosis.
        </span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`glass-panel p-6 rounded-2xl border border-slate-800 bg-[#0c1018]/90 text-slate-300 ${className}`}>
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-white flex items-center gap-2">
              Academic & Research Medical Disclaimer
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/20 font-mono">
                NON-CLINICAL
              </span>
            </h4>
            <p className="text-sm leading-relaxed text-slate-300">
              NeuralScan is an academic/research prototype and is not a medical diagnostic device. 
              Model predictions should not be used as a substitute for evaluation by a qualified healthcare professional.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                No treatment recommendations
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                No medication prescription
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                No clinical validation implied
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: banner
  return (
    <div className={`p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-200/90 text-xs sm:text-sm ${className}`}>
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-amber-300">Important Notice: </span>
          NeuralScan is an academic/research prototype and is not a medical diagnostic device. 
          Model predictions should not be used as a substitute for evaluation by a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
};
