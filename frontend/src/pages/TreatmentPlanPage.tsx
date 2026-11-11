import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import type { PatientAssessment, AITreatmentPlan } from '../services/groq';
import { generateMedicalReportPDF } from '../utils/pdfGenerator';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  FileDown,
  Pill,
  Clock,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  Info,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export const TreatmentPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const state = location.state as {
    diagnosis?: string;
    confidence?: number;
    patient?: PatientAssessment;
    treatmentPlan?: AITreatmentPlan;
    imageFileName?: string;
    imageUrl?: string;
  } | null;

  const diagnosis = state?.diagnosis;
  const confidence = state?.confidence ?? 0;
  const patient = state?.patient;
  const treatmentPlan = state?.treatmentPlan;
  const imageFileName = state?.imageFileName;
  const imageUrl = state?.imageUrl;

  const handleDownloadPDF = async () => {
    if (!treatmentPlan || !diagnosis || !patient) return;
    try {
      setIsGeneratingPDF(true);
      await generateMedicalReportPDF(diagnosis, confidence, patient, treatmentPlan, {
        imageFileName,
        imageUrl,
      });
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getSeverityBadgeColor = (tier: string) => {
    switch (tier) {
      case 'Critical':
        return 'bg-red-950/80 border-red-500 text-red-400';
      case 'Severe':
        return 'bg-amber-950/80 border-amber-500 text-amber-400';
      case 'Moderate':
        return 'bg-yellow-950/80 border-yellow-500 text-yellow-300';
      case 'Mild':
      default:
        return 'bg-emerald-950/80 border-emerald-500 text-emerald-400';
    }
  };

  // If accessed directly without a generated treatment plan, prompt user to complete questionnaire first
  if (!treatmentPlan || !diagnosis || !patient) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900/80 border border-red-500/20 backdrop-blur-xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-5">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Treatment Plan Not Generated
          </h2>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            No active clinical consultation data found in this session. Please complete the patient triage questionnaire to generate personalized medical guidance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/ai-doctor')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-900/40"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Go to Patient Questionnaire</span>
            </button>
            <button
              onClick={() => navigate('/analyze')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Activity className="w-4 h-4" />
              <span>Analyze New X-Ray</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 bg-transparent pb-24 animate-in fade-in duration-300">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() =>
              navigate('/ai-doctor', {
                state: {
                  prediction: diagnosis,
                  confidence,
                  imageFileName,
                  imageUrl,
                },
              })
            }
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Edit Patient Vitals
          </button>

          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-red-400" /> Analyze Another X-Ray
          </Link>
        </div>

        {/* Header Hero */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Patient Treatment Plan & Prescriptions
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-3xl">
            Synthesized clinical findings, physician intervention timeline, guideline-concordant medications, and exportable medical report.
          </p>
        </div>

        {/* PATIENT & DIAGNOSIS SUMMARY STRIP */}
        <div className="mb-10 p-5 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900/90 to-black/80 border border-red-500/30 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-red-500/40 bg-black shrink-0">
                <img
                  src={imageUrl}
                  alt="Scanned radiograph"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Activity className="w-8 h-8" />
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
                  Source: <span className="font-mono text-slate-300">{imageFileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Patient Quick Vitals Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200">
              Age: <strong className="text-white">{patient.age}y</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200">
              Sex: <strong className="text-white">{patient.gender}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200">
              Duration: <strong className="text-white">{patient.durationDays} days</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200">
              SpO2: <strong className="text-amber-300">{patient.spo2}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200">
              Fever: <strong className="text-white">{patient.fever}</strong>
            </span>
          </div>
        </div>

        <div className="space-y-10">
          {/* SECTION 1: TRIAGE STRATIFICATION & CONSULTATION TIMELINE */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Activity className="w-6 h-6 text-red-400" />
                  1. Clinical Triage & When the Doctor Must Treat
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Evaluates care severity, patient setting, and clinical referral urgency.
                </p>
              </div>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">
                Triage Protocol
              </span>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Severity Card */}
              <div
                className={`p-5 rounded-2xl border backdrop-blur-xl ${getSeverityBadgeColor(
                  treatmentPlan.severityTier
                )}`}
              >
                <div className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-1">
                  Severity Stratification
                </div>
                <div className="text-2xl font-black tracking-wide">
                  {treatmentPlan.severityTier} Risk
                </div>
                <p className="text-xs mt-2 opacity-90">
                  Calculated from radiological findings and reported symptoms.
                </p>
              </div>

              {/* Recommended Care Facility */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
                  Recommended Care Setting
                </div>
                <div className="text-xl font-bold text-white">
                  {treatmentPlan.careSetting}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Appropriate clinical level for safe medical management.
                </p>
              </div>

              {/* Urgency / When to see doctor */}
              <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wider font-semibold text-red-400 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> When Doctor Must Treat
                </div>
                <div className="text-xl font-bold text-white">
                  {treatmentPlan.urgencyTimeline}
                </div>
                <p className="text-xs text-red-200/80 mt-2">
                  Required timeline for clinical in-person examination.
                </p>
              </div>
            </div>

            {/* Diagnostic Clinical Synthesis */}
            <div className="p-5 rounded-2xl bg-black/30 border border-white/5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-red-400" />
                Clinical Diagnostic Synthesis
              </h3>
              <p className="text-slate-200 text-sm leading-relaxed">
                {treatmentPlan.clinicalSummary}
              </p>
            </div>

            {/* Sequential Treatment Steps */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-3">
                Sequential Clinical Treatment Steps:
              </h3>
              <div className="space-y-3">
                {treatmentPlan.treatmentSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-red-500/30 transition-all flex items-start gap-4"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-slate-200 leading-relaxed">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: PHARMACOLOGICAL REGIMEN & ALL MEDICATIONS */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <Pill className="w-6 h-6 text-red-400" />
                  2. Pharmacological Regimen & All Medications
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Evidence-based medications, standard adult dosages, administration routes, and safety contraindications.
                </p>
              </div>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300">
                Rx Guidance
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {treatmentPlan.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-black/40 border border-white/10 hover:border-red-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-bold text-white text-base">
                        {med.name}
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 shrink-0">
                        {med.category}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs mt-3">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-semibold text-slate-400 min-w-[70px]">
                          Dosage:
                        </span>
                        <span className="font-mono text-amber-300">
                          {med.dosage}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-semibold text-slate-400 min-w-[70px]">
                          Frequency:
                        </span>
                        <span className="text-slate-200">{med.frequency}</span>
                      </div>

                      <div className="text-slate-300 pt-1">
                        <span className="font-semibold text-slate-400 block mb-0.5">
                          Clinical Indication:
                        </span>
                        <span className="text-slate-300 text-[11px] leading-relaxed">
                          {med.purpose}
                        </span>
                      </div>

                      <div className="text-red-300/90 pt-1 bg-red-950/20 p-2.5 rounded-lg border border-red-500/10">
                        <span className="font-semibold text-red-400 text-[11px] block mb-0.5">
                          Contraindications / Warnings:
                        </span>
                        <span className="text-[11px] leading-relaxed">
                          {med.contraindications}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Red Flag Warnings & Supportive Care */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              {/* Emergency Red Flags */}
              <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/30">
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Emergency Red Flags (Call 911 / ER)
                </h3>
                <ul className="space-y-2 text-xs text-slate-200">
                  {treatmentPlan.redFlagWarnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Supportive Care */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Supportive Care & Monitoring
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {treatmentPlan.supportiveCare.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 3: DOWNLOAD COMPLETE MEDICAL REPORT (PDF) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/60 via-slate-900/90 to-black/90 border border-red-500/40 backdrop-blur-2xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                  <FileDown className="w-6 h-6 text-red-400" />
                  3. Download Full Clinical Treatment Report (PDF)
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  Export complete medical documentation containing patient vitals, model confidence, full treatment steps, and all medications.
                </p>
              </div>
              <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-300 self-start sm:self-auto">
                PDF Export
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                {treatmentPlan.disclaimer}
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-75 disabled:cursor-not-allowed shadow-xl shadow-red-700/40 transition-all group"
                >
                  {isGeneratingPDF ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Clinical PDF...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                      <span>Download Full Treatment Report (PDF)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlanPage;
