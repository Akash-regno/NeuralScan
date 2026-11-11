import { AlertTriangle } from 'lucide-react';

interface DisagreementProps {
  voteCounts: Record<string, number>;
  differingModels: string[];
  totalModels: number;
}

export const DisagreementAlertCard: React.FC<DisagreementProps> = ({
  voteCounts,
  differingModels,
  totalModels,
}) => {
  const activeVotes = Object.entries(voteCounts).filter(([_, count]) => count > 0);

  return (
    <div className="w-full p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 backdrop-blur-xl shadow-lg space-y-3 animate-in fade-in duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-300">
              Model Disagreement Detected
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
              Divergent ({totalModels} Models)
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-white">
            The three models produced differing primary classifications.
          </h4>

          <p className="text-xs text-amber-100/80 leading-relaxed">
            Review individual probability distributions and predictive entropy before interpreting the weighted ensemble result. This radiographic presentation exhibits visual features that separate the network architectures.
          </p>
        </div>
      </div>

      {/* Voting Breakdown Chips */}
      <div className="pt-2 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Voting Distribution:</span>
          {activeVotes.map(([cls, count]) => (
            <span
              key={cls}
              className="px-2.5 py-1 rounded-lg bg-black/50 border border-amber-500/30 text-amber-200 font-mono text-xs font-semibold"
            >
              {count} model{count > 1 ? 's' : ''} → <strong className="text-white">{cls}</strong>
            </span>
          ))}
        </div>

        {differingModels.length > 0 && (
          <div className="text-[11px] font-mono text-slate-400">
            Divergent: <span className="text-amber-300 font-semibold">{differingModels.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisagreementAlertCard;
