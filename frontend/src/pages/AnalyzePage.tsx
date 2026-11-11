import { useState } from 'react';
import { UploadCard } from '../components/UploadCard';
import { ResultsView } from '../components/ResultsView';
import { ThreeModelDebateTimeline } from '../components/ThreeModelDebateTimeline';
import type { MultiModelPredictionResponse } from '../types';
import { predictXray } from '../services/api';

export const AnalyzePage: React.FC = () => {
  const [result, setResult] = useState<MultiModelPredictionResponse | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    // Create a local blob preview url if not already set
    const previewUrl = URL.createObjectURL(file);
    setCurrentImageUrl(previewUrl);
    setCurrentFileName(file.name);

    try {
      const response = await predictXray(file);
      setResult(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to analyze this image.';
      setErrorMessage(msg);
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (currentImageUrl) {
      URL.revokeObjectURL(currentImageUrl);
    }
    setResult(null);
    setCurrentImageUrl(null);
    setCurrentFileName('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {result && currentImageUrl ? (
        <ResultsView
          result={result}
          imageUrl={currentImageUrl}
          imageFileName={currentFileName}
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-6">
          {isAnalyzing && (
            <ThreeModelDebateTimeline isAnalyzing={isAnalyzing} />
          )}
          <UploadCard
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
          />
        </div>
      )}
    </div>
  );
};

export default AnalyzePage;
