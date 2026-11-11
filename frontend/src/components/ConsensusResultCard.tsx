import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Sparkles,
} from 'lucide-react';
import type { MultiModelPredictionResponse } from '../types';

interface ConsensusCardProps {
  response: MultiModelPredictionResponse;
  imageUrl?: string;
  imageFileName?: string;
}

const CLASS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Covid: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  Tuberculosis: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Normal: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Pneumonia: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

export const ConsensusResultCard: React.FC<ConsensusCardProps> = ({
  response,
  imageUrl,
  imageFileName,
}) => {
  const navigate = useNavigate();
  const cColor = CLASS_COLORS[response.final_prediction] || CLASS_COLORS.Covid;
  return (
    <div className="w-full rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 via-black/90 to-[#07090e] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Top Banner Header */}
      <div className="pb-5 border-b border-white/10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Final Tri-Model Consensus
        </h2>
      </div>

      {/* Main Prediction & Probability Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Prediction Block */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Consensus Output Class
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight ${cColor.text}`}>
              {response.final_prediction}
            </span>
            <div className="pl-4 border-l border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                {(response.final_probability * 100).toFixed(1)}%
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Consensus Probability
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-1">
            Entropy: <strong className="text-white font-mono">{response.uncertainty.entropy.toFixed(3)} bits</strong> • 
            Inference: <strong className="text-white font-mono">{response.processing_time_ms} ms</strong> • 
            Cleaned 65k Dataset Baseline
          </p>
        </div>

        {/* Right: How the Models Voted */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>How the Models Voted</span>
            <span className="text-[10px] text-slate-500">3 Observers</span>
          </div>

          <div className="space-y-2">
            {Object.entries(response.models).map(([mKey, detail]) => {
              const isMatch = detail.prediction === response.final_prediction;
              return (
                <div
                  key={mKey}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <span className="font-semibold text-slate-200">{detail.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isMatch ? 'text-white' : 'text-amber-400'}`}>
                      {detail.prediction}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {(detail.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Evidence Synthesis (No fake conversation, strictly numerical) */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-2 leading-relaxed">
        <div className="font-bold text-white flex items-center gap-1.5 uppercase font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          Numerical Model Evidence Synthesis
        </div>
        <p>
          ResNet50 assigned <strong className="text-white font-mono">{(response.models.resnet50?.probabilities[response.final_prediction] * 100).toFixed(1)}%</strong>, 
          DenseNet121 assigned <strong className="text-white font-mono">{(response.models.densenet121?.probabilities[response.final_prediction] * 100).toFixed(1)}%</strong>, 
          and EfficientNetB0 assigned <strong className="text-white font-mono">{(response.models.efficientnetb0?.probabilities[response.final_prediction] * 100).toFixed(1)}%</strong> probability to {response.final_prediction}. 
          Applying the validation-derived ensemble weights ({response.ensemble_weights?.resnet50} / {response.ensemble_weights?.densenet121} / {response.ensemble_weights?.efficientnetb0}) yielded a final posterior probability of <strong className="text-white font-mono">{(response.final_probability * 100).toFixed(1)}%</strong> with {response.model_agreement}/3 model agreement.
        </p>
      </div>

      {/* AI Doctor Decision Support CTA */}
      <div className="pt-2 flex justify-end">

        <button
          onClick={() =>
            navigate('/ai-doctor', {
              state: {
                prediction: response.final_prediction,
                confidence: response.final_probability,
                imageFileName,
                imageUrl,
                consensusResponse: response,
              },
            })
          }
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-xl shadow-red-900/40 hover:shadow-red-600/50 transition-all cursor-pointer shrink-0"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Launch AI Doctor Consultation</span>
        </button>
      </div>
    </div>
  );
};

export default ConsensusResultCard;
