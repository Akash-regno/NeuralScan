import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { UncertaintyDetail } from '../types';

interface HardCaseProps {
  uncertainty: UncertaintyDetail;
}

export const HardCaseAlertCard: React.FC<HardCaseProps> = ({ uncertainty }) => {
  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-500/40 backdrop-blur-xl shadow-lg space-y-3 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-rose-300">
              Research Hard Case Identified
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-200 border border-rose-500/30">
              Entropy: {uncertainty.entropy.toFixed(3)} bits
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-white">
            High Predictive Dispersion & Ambiguous Radiographic Presentation
          </h4>

          <p className="text-xs text-rose-100/80 leading-relaxed">
            {uncertainty.reasoning} In an academic evaluation, this scan should be treated as an ambiguous borderline sample requiring secondary radiological review.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <span>Average Model Entropy: <strong className="text-white">{uncertainty.average_entropy.toFixed(3)} bits</strong></span>
        <span>Mean Inter-Model Variance: <strong className="text-white">{uncertainty.mean_variance.toFixed(4)}</strong></span>
      </div>
    </div>
  );
};

export default HardCaseAlertCard;
