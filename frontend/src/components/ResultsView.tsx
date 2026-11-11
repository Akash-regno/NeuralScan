import React, { useState } from 'react';
import { RefreshCw, Scan, Eye } from 'lucide-react';
import type { MultiModelPredictionResponse } from '../types';
import { MedicalDisclaimer } from './MedicalDisclaimer';
import ThreeModelDebateTimeline from './ThreeModelDebateTimeline';
import ThreeModelCards from './ThreeModelCards';
import ConsensusResultCard from './ConsensusResultCard';
import GroupedProbabilityChart from './GroupedProbabilityChart';
import DisagreementAlertCard from './DisagreementAlertCard';
import HardCaseAlertCard from './HardCaseAlertCard';

interface ResultsViewProps {
  result: MultiModelPredictionResponse;
  imageUrl: string;
  imageFileName: string;
  onReset: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  imageUrl,
  imageFileName,
  onReset,
}) => {
  const [showScanGrid, setShowScanGrid] = useState(true);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      {/* 1. Top Banner Disclaimer */}
      <MedicalDisclaimer variant="compact" />

      {/* 2. Animated AI Debate Pipeline Timeline */}
      <ThreeModelDebateTimeline isAnalyzing={false} />

      {/* 3. Conditional Alerts: Disagreement and/or Hard Case */}
      {result.disagreement_detected && (
        <DisagreementAlertCard
          voteCounts={result.vote_counts}
          differingModels={result.differing_models}
          totalModels={result.total_models}
        />
      )}

      {result.uncertainty.hard_case && (
        <HardCaseAlertCard uncertainty={result.uncertainty} />
      )}

      {/* 4. Top Grid: X-Ray Image Preview & Final Consensus Result Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: X-Ray Image View */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-[#0a0e17] relative shadow-xl">
            {/* Image Header bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0d131f]/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-red-400" />
                <span className="font-mono truncate max-w-[180px]" title={imageFileName}>
                  {imageFileName || 'Chest_XRay.png'}
                </span>
              </div>
              <button
                onClick={() => setShowScanGrid(!showScanGrid)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors border cursor-pointer ${
                  showScanGrid
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Toggle Thoracic Scan Grid Overlay"
              >
                <Eye className="w-3 h-3" />
                Grid
              </button>
            </div>

            {/* X-Ray Image Container */}
            <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden group">
              <img
                src={imageUrl}
                alt="Uploaded Chest X-Ray"
                className="w-full h-full object-contain filter contrast-105"
              />

              {/* High-tech scanning reticle & grid overlay */}
              {showScanGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Grid Lines */}
                  <div className="w-full h-full border border-red-500/20 grid grid-cols-3 grid-rows-3 opacity-40">
                    <div className="border-r border-b border-red-500/20" />
                    <div className="border-r border-b border-red-500/20" />
                    <div className="border-b border-red-500/20" />
                    <div className="border-r border-b border-red-500/20" />
                    <div className="border-r border-b border-red-500/20" />
                    <div className="border-b border-red-500/20" />
                    <div className="border-r border-red-500/20" />
                    <div className="border-r border-red-500/20" />
                    <div />
                  </div>

                  {/* Corner Reticles */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-red-500/80" />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-red-500/80" />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-red-500/80" />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-red-500/80" />

                  {/* Center Target Point */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-red-500/50 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                  </div>

                  {/* Multi-Model Input Badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/80 backdrop-blur border border-red-500/30 text-[10px] font-mono text-red-400">
                    3× ARCHITECTURES: 224×224×3
                  </div>
                </div>
              )}
            </div>

            {/* Image Footer info */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Thoracic PA/AP View</span>
              <span className="font-mono text-slate-500">In-Memory Tensors</span>
            </div>
          </div>

          {/* Analyze Another X-Ray Button */}
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium transition-all shadow-sm hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-red-400" />
            Analyze Another X-Ray
          </button>
        </div>

        {/* Right Column: Final Consensus Result Card */}
        <div className="lg:col-span-8">
          <ConsensusResultCard
            response={result}
            imageUrl={imageUrl}
            imageFileName={imageFileName}
          />
        </div>
      </div>

      {/* 5. Three Independent Neural Observer Cards */}
      <ThreeModelCards
        models={result.models}
        weights={result.ensemble_weights}
        consensusPrediction={result.final_prediction}
      />

      {/* 6. Grouped Probability Comparison (4 Classes × 4 Estimators) */}
      <GroupedProbabilityChart
        models={result.models}
        consensusProbabilities={result.consensus_probabilities}
      />
    </div>
  );
};

export default ResultsView;
