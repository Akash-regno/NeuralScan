import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  generateAITreatmentPlan,
  type PatientAssessment,
} from '../services/groq';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  HeartPulse,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export const AIDoctorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navState = location.state as {
    prediction?: string;
    confidence?: number;
    imageFileName?: string;
    imageUrl?: string;
  } | null;

  // Auto-selected from model prediction — no manual select dropdown!
  const diagnosis = navState?.prediction || '';
  const confidence = navState?.confidence ?? 0;
  const imageFileName = navState?.imageFileName;
  const imageUrl = navState?.imageUrl;

  // Clean, non-hardcoded patient triage questionnaire state
  const [patient, setPatient] = useState<PatientAssessment>({
    age: '',
    gender: 'Male',
    durationDays: '',
    fever: 'None',
    cough: 'None',
    spo2: 'Normal (>95%)',
    breathShortness: 'None',
    chestPain: false,
    comorbidities: [],
    currentMedications: '',
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [formValidationWarning, setFormValidationWarning] = useState<string | null>(null);

  // Comorbidities options for multi-select
  const comorbidityOptions = [
    'Hypertension',
    'Diabetes Type 2',
    'Asthma / COPD',
    'Cardiovascular Disease',
    'Immunocompromised',
    'Chronic Kidney Disease',
    'Smoking History',
    'None',
  ];

  const handleToggleComorbidity = (item: string) => {
    if (item === 'None') {
      setPatient((prev) => ({ ...prev, comorbidities: [] }));
      return;
    }
    setPatient((prev) => {
      const exists = prev.comorbidities.includes(item);
      const updated = exists
        ? prev.comorbidities.filter((c) => c !== item)
        : [...prev.comorbidities.filter((c) => c !== 'None'), item];
      return { ...prev, comorbidities: updated };
    });
  };

  const handleGeneratePlan = async () => {
    if (!diagnosis) {
      setGenerationError('No radiograph diagnosis available. Please analyze an X-Ray first.');
      return;
    }

    if (!patient.age || !patient.durationDays) {
      setFormValidationWarning('Please fill in patient Age and Symptom Duration to personalize the clinical plan.');
      return;
    }

    setFormValidationWarning(null);
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const plan = await generateAITreatmentPlan(
        diagnosis,
        confidence,
        patient
      );

      // Navigate to dedicated treatment plan page
      navigate('/treatment-plan', {
        state: {
          diagnosis,
          confidence,
          patient,
          treatmentPlan: plan,
          imageFileName,
          imageUrl,
        },
      });
    } catch (err) {
      console.error('Treatment plan generation failed:', err);
      setGenerationError(
        err instanceof Error
          ? err.message
          : 'Failed to generate plan. Please verify Groq API key or network connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // If accessed directly without an X-Ray prediction, prompt user to analyze first
  if (!diagnosis) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/80 border border-red-500/20 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-5">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">
            X-Ray Scan Required for AI Doctor
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            The AI Doctor provides customized treatment, prescription drugs, and doctor consultation timelines based on the ResNet50 model's radiological diagnosis. Please upload and analyze a chest radiograph first.
          </p>
          <button
            onClick={() => navigate('/analyze')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/40"
          >
            <Activity className="w-4 h-4" />
            <span>Go to Radiograph Analyzer</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 bg-transparent pb-24">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Radiograph Analysis
          </Link>
        </div>

        {/* Header Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            AI Doctor Consultation & Treatment
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
            A comprehensive 4-step clinical workflow: triage patient vitals, generate guideline-based treatments, determine doctor timelines, and export complete medical reports.
          </p>
        </div>

        {/* STEP PROGRESS BAR */}
        <div className="mb-10 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Step 1 Pill */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-white">
              <div className="w-7 h-7 rounded-lg bg-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider text-red-300 font-semibold">
                  Step 1 (Active)
                </div>
                <div className="text-xs font-bold text-white">Patient Vitals</div>
              </div>
            </div>

            {/* Step 2 Pill */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  Next Page
                </div>
                <div className="text-xs font-bold text-slate-300">Treatment Plan</div>
              </div>
            </div>

            {/* Step 3 Pill */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  Next Page
                </div>
                <div className="text-xs font-bold text-slate-300">Medications</div>
              </div>
            </div>

            {/* Step 4 Pill */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div className="text-left">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">
                  Next Page
                </div>
                <div className="text-xs font-bold text-slate-300">PDF Report</div>
              </div>
            </div>
          </div>
        </div>

        {/* AUTOMATICALLY DETECTED RADIOLOGICAL FINDING (LOCKED, NO MANUAL SELECT) */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900/90 to-black/80 border border-red-500/30 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-red-500/40 bg-black shrink-0">
                <img
                  src={imageUrl}
                  alt="Scanned radiograph"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Activity className="w-7 h-7" />
              </div>
            )}
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3 mt-0.5">
                <span>{diagnosis}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-mono">
                  {(confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>
              {imageFileName && (
                <div className="text-xs text-slate-400 mt-1">
                  Source Scan: <span className="font-mono text-slate-300">{imageFileName}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STEP 1: PATIENT CLINICAL TRIAGE QUESTIONNAIRE */}
        <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <HeartPulse className="w-6 h-6 text-red-400" />
                Step 1: Patient Clinical Assessment & Vitals
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Please answer the patient vitals to generate a personalized treatment plan and prescribe suitable medications.
              </p>
            </div>
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
              Required
            </span>
          </div>

          {formValidationWarning && (
            <div className="mb-6 p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{formValidationWarning}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Patient Age *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patient.age}
                onChange={(e) =>
                  setPatient({ ...patient, age: e.target.value })
                }
                placeholder="Enter patient age (e.g. 52)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
            </div>

            {/* Biological Sex */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Biological Sex
              </label>
              <select
                value={patient.gender}
                onChange={(e) =>
                  setPatient({ ...patient, gender: e.target.value })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Duration of symptoms */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Symptom Duration (Days) *
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={patient.durationDays}
                onChange={(e) =>
                  setPatient({ ...patient, durationDays: e.target.value })
                }
                placeholder="Number of days (e.g. 5)"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
            </div>

            {/* Fever */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Body Temperature / Fever
              </label>
              <select
                value={patient.fever}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    fever: e.target.value as PatientAssessment['fever'],
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              >
                <option value="None">None (Normal &lt; 99°F)</option>
                <option value="Mild (99-101°F)">Mild (99°F - 101°F)</option>
                <option value="High (>101°F)">High Grade (&gt; 101°F)</option>
              </select>
            </div>

            {/* Cough */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cough Symptoms
              </label>
              <select
                value={patient.cough}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    cough: e.target.value as PatientAssessment['cough'],
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              >
                <option value="None">No Cough</option>
                <option value="Mild Dry Cough">Mild Dry Cough</option>
                <option value="Persistent Wet/Productive">
                  Persistent Productive / Phlegm
                </option>
                <option value="Blood-Tinged / Hemoptysis">
                  Blood-Tinged / Hemoptysis
                </option>
              </select>
            </div>

            {/* Pulse Oximetry (SpO2) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Oxygen Saturation (SpO2)
              </label>
              <select
                value={patient.spo2}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    spo2: e.target.value as PatientAssessment['spo2'],
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              >
                <option value="Normal (>95%)">Normal (&gt; 95%)</option>
                <option value="Borderline (91-94%)">
                  Borderline (91% - 94%)
                </option>
                <option value="Critical (<90%)">Critical (&lt; 90%)</option>
              </select>
            </div>

            {/* Dyspnea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Shortness of Breath (Dyspnea)
              </label>
              <select
                value={patient.breathShortness}
                onChange={(e) =>
                  setPatient({
                    ...patient,
                    breathShortness: e.target
                      .value as PatientAssessment['breathShortness'],
                  })
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              >
                <option value="None">None</option>
                <option value="Only on exertion">Only on exertion / walking</option>
                <option value="At rest / Severe">Severe / Present at rest</option>
              </select>
            </div>

            {/* Pleuritic Chest Pain */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chest Pain While Breathing
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setPatient({ ...patient, chestPain: !patient.chestPain })
                  }
                  className={`flex-1 py-2 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    patient.chestPain
                      ? 'bg-red-500/20 border-red-500 text-red-300'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {patient.chestPain ? 'Present (Yes)' : 'Absent (No)'}
                </button>
              </div>
            </div>

            {/* Current Medications */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Current Medications
              </label>
              <input
                type="text"
                value={patient.currentMedications}
                onChange={(e) =>
                  setPatient({ ...patient, currentMedications: e.target.value })
                }
                placeholder="e.g. Lisinopril, Metformin, None"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Comorbidities Selection */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Pre-existing Comorbidities & Medical History
            </label>
            <div className="flex flex-wrap gap-2">
              {comorbidityOptions.map((item) => {
                const isSelected =
                  item === 'None'
                    ? patient.comorbidities.length === 0
                    : patient.comorbidities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleComorbidity(item)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-red-500/20 border-red-500 text-red-300 shadow-sm'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action to proceed to Step 2 */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-white/10">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGeneratePlan}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-lg shadow-red-900/30 hover:shadow-red-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Synthesizing AI Medical Regimen...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Generate Treatment Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {generationError && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400" />
              <span>{generationError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDoctorPage;
