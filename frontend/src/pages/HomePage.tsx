import React from 'react';
import { Hero } from '../components/Hero';

interface HomePageProps {
  onNavigateToAnalyze?: () => void;
  onNavigateToAbout?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToAnalyze,
  onNavigateToAbout,
}) => {
  return (
    <div className="w-full pb-12">
      <Hero
        onAnalyzeClick={onNavigateToAnalyze}
        onHowItWorksClick={onNavigateToAbout}
      />
    </div>
  );
};

export default HomePage;
