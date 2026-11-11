import React from 'react';
import { MetricsSection } from '../components/MetricsSection';

export const MetricsPage: React.FC = () => {
  return (
    <div className="w-full space-y-12 pb-16 pt-4 animate-in fade-in duration-300">
      <MetricsSection />
    </div>
  );
};

export default MetricsPage;
