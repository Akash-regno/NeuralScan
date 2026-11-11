import React from 'react';
import { AboutSection } from '../components/AboutSection';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full space-y-8 pb-16 pt-4 animate-in fade-in duration-300">
      <AboutSection />
      <div className="max-w-5xl mx-auto">
        <MedicalDisclaimer variant="full" />
      </div>
    </div>
  );
};

export default AboutPage;
