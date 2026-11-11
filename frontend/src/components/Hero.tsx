import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import FoldText from './FoldText';

interface HeroProps {
  onAnalyzeClick?: () => void;
  onHowItWorksClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onAnalyzeClick, onHowItWorksClick }) => {
  const navigate = useNavigate();

  const handleAnalyze = () => {
    if (onAnalyzeClick) onAnalyzeClick();
    else navigate('/analyze');
  };

  const handleHowItWorks = () => {
    if (onHowItWorksClick) onHowItWorksClick();
    else navigate('/about');
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 select-none">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN: HERO TEXT & ACTIONS */}
        <div className="lg:col-span-6 text-left space-y-6">
          {/* Main Headline with React Bits FoldText */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            <FoldText
              text="Intelligent Chest"
              splitBy="char"
              hinge="top"
              trigger="mount"
              duration={0.7}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize="inherit"
              fontWeight="inherit"
              color="#ffffff"
            />
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-red-300">
              X-Ray Analysis
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
            AI-assisted multi-model consensus system for thoracic radiographs. Accurate 4-class differentiation for COVID-19, Tuberculosis, Normal, and Pneumonia.
          </p>

          {/* Action Buttons: [Get Started ->] [Learn More] */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={handleAnalyze}
              className="px-8 py-3.5 rounded-full font-bold text-sm sm:text-base bg-white text-black hover:bg-slate-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center gap-2 cursor-pointer group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleHowItWorks}
              className="px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: VIDEO WINDOW WITH CLEAN 3 DOTS (NO TEXT, SLIGHTLY COMPACT SIZE) */}
        <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg lg:max-w-none rounded-3xl border border-red-500/30 bg-black/95 shadow-[0_0_50px_rgba(255,0,0,0.2)] overflow-hidden flex flex-col">
            {/* Window Top Bar: Clean 3 dots only, no text */}
            <div className="flex items-center px-4 py-2.5 bg-[#0c0c10] border-b border-red-500/20 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
              </div>
            </div>

            {/* Video Body */}
            <div className="relative w-full aspect-video min-h-[260px] sm:min-h-[320px] lg:min-h-[360px]">
              <video
                src="/video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
