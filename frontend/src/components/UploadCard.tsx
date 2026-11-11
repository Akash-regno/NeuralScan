import { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface UploadCardProps {
  onAnalyze: (file: File) => Promise<void>;
  isAnalyzing: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onAnalyze,
  isAnalyzing,
  errorMessage,
  setErrorMessage,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    const lowerName = file.name.toLowerCase();

    const matchesExt = validExtensions.some((ext) => lowerName.endsWith(ext));
    if (!validTypes.includes(file.type) && !matchesExt) {
      setErrorMessage('Please upload a valid JPG, JPEG, or PNG image.');
      return;
    }

    const MAX_SIZE_MB = 10;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage('File size exceeds 10 MB limit. Please select a smaller image.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) return;
    await onAnalyze(selectedFile);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Title & Subtitle Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Analyze Chest X-Ray
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Upload a chest X-ray image for AI-assisted classification.
        </p>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-rose-200">Analysis Error: </span>
            {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload / Preview Area */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-[#0d0f17]/90 relative overflow-hidden">
        {previewUrl ? (
          /* PREVIEW STATE */
          <div className="space-y-6">
            <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-2xl flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected Chest X-Ray Preview"
                className="w-full h-full object-contain filter contrast-105"
              />

              {/* Scanning visual overlay when analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
                    <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-25" />
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-base font-semibold text-white font-mono tracking-wider animate-pulse">
                      Analyzing X-Ray...
                    </div>
                  </div>
                  {/* Sweeping scanline */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_15px_#ff0000] animate-scan opacity-90" />
                </div>
              )}

              {/* Top tag */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur border border-slate-700 text-[11px] font-mono text-slate-300">
                {selectedFile?.name}
              </div>

              {!isAnalyzing && (
                <button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Action Buttons: "Analyze X-Ray" and "Remove" */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isAnalyzing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-600/25 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    <span>Analyzing X-Ray...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze X-Ray</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRemove}
                disabled={isAnalyzing}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY UPLOAD ZONE */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
              isDragOver
                ? 'border-red-500 bg-red-500/10 scale-[1.01]'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 group-hover:border-red-500/50 group-hover:text-red-400 text-slate-400 transition-all shadow-md">
                <UploadCloud className="w-8 h-8 transition-colors" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-white group-hover:text-red-300 transition-colors">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-slate-400">
                  Supported formats: JPG, JPEG, PNG
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-[11px] font-mono text-slate-400">
                Maximum file size: 10 MB
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
