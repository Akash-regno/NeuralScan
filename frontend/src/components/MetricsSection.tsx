import { BarChart2, AlertCircle } from 'lucide-react';

export const MetricsSection: React.FC = () => {
  const f1Scores = [
    { name: 'COVID-19', score: '97.99%', color: 'from-red-600 to-red-500', barWidth: 97.99 },
    { name: 'Tuberculosis', score: '98.60%', color: 'from-red-500 to-rose-600', barWidth: 98.60 },
    { name: 'Normal', score: '94.33%', color: 'from-emerald-500 to-teal-500', barWidth: 94.33 },
    { name: 'Pneumonia', score: '94.62%', color: 'from-rose-500 to-red-500', barWidth: 94.62 },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Model Performance Evaluation
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Experimental test-set classification accuracy and per-class harmonic F1 metrics evaluated on held-out test split.
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-red-500/30 bg-[#0c1018]/90 shadow-[0_0_25px_rgba(255,0,0,0.08)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>OVERALL TEST ACCURACY</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
              Held-Out Split
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono mb-2">
            96.52%
          </div>
          <p className="text-xs text-slate-400">
            96.52% test-set classification accuracy across 6,524 stratified test samples.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-[#0c1018]/90 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span>TEST CROSS-ENTROPY LOSS</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Convergence
            </span>
          </div>
          <div className="text-4xl sm:text-5xl font-extrabold text-red-400 tracking-tight font-mono mb-2">
            0.0998
          </div>
          <p className="text-xs text-slate-400">
            Categorical cross-entropy loss measured on the clean test partition.
          </p>
        </div>
      </div>

      {/* Per-Class F1 Score Breakdown Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 bg-[#0d0f17]/90 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-semibold text-white">
              Per-Class F1 Score Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Precision / Recall Harmonic Mean
          </span>
        </div>

        <div className="space-y-4">
          {f1Scores.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200">
                  {item.name}
                </span>
                <span className="font-mono font-bold text-white">
                  {item.score}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`}
                  style={{ width: `${item.barWidth}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Note */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-300 text-xs flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          These results represent an experimental evaluation on this specific dataset split and do not establish clinical performance.
        </p>
      </div>
    </div>
  );
};
