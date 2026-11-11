import { Filter, Layers, CheckCircle2, Split, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const datasetSplits = [
    { label: 'Training Set', count: '52,192', percentage: '80%', desc: 'Deep feature representation learning' },
    { label: 'Validation Set', count: '6,524', percentage: '10%', desc: 'Hyperparameter tuning & checkpoint selection' },
    { label: 'Testing Set', count: '6,524', percentage: '10%', desc: 'Final unbiased generalization assessment' },
  ];

  const preprocessingSteps = [
    'Exact duplicate image analysis and removal',
    'Cross-class duplicate detection across repositories',
    'Ambiguous and corrupted radiograph filtering',
    'Stratified train/validation/test random partitioning',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About NeuralScan
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          NeuralScan is an academic chest X-ray classification research prototype investigating deep residual network discrimination on thoracic pathologies.
        </p>
      </div>

      {/* Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d0f17]/90 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-red-400" />
          System Overview & Target Classes
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          The primary AI engine relies on a single fine-tuned <strong>ResNet50</strong> architecture trained to classify chest radiographs across 4 mutually exclusive categories:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {['COVID-19', 'Tuberculosis', 'Normal', 'Pneumonia'].map((cls, i) => (
            <div
              key={cls}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1"
            >
              <span className="text-[10px] font-mono text-slate-500 block">CLASS {i}</span>
              <span className="font-semibold text-sm text-white">{cls}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset & Curation Methodology */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d0f17]/90 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">
              Dataset Curation Pipeline
            </h3>
          </div>
          <span className="text-xs font-mono text-red-400 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20">
            65,240 Cleaned Images
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Over <strong>72,000+</strong> original radiograph images were initially ingested. To prevent data leakage and label corruption, rigorous data hygiene was enforced:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {preprocessingSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Dataset Split Numbers */}
        <div className="pt-4 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Split className="w-3.5 h-3.5 text-red-400" />
            Stratified Split Distribution (Total: 65,240 Images)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {datasetSplits.map((split) => (
              <div
                key={split.label}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{split.label}</span>
                  <span className="font-mono text-red-400">{split.percentage}</span>
                </div>
                <div className="text-2xl font-bold font-mono text-white">
                  {split.count}
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  {split.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explicit Scientific Performance Claim */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-2">
        <h4 className="text-xs font-mono uppercase tracking-wider text-red-400 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Evaluation Distinction
        </h4>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The reported <strong>96.52%</strong> represents the test-set classification accuracy on this specific experimental partition. 
          It must not be characterized as "96.52% medical accuracy," as clinical diagnostic validity requires multi-site prospective validation.
        </p>
      </div>
    </div>
  );
};
