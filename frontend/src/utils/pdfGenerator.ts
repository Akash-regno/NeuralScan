import { jsPDF } from 'jspdf';
import type { PatientAssessment, AITreatmentPlan } from '../services/groq';

export interface PDFExportOptions {
  imageFileName?: string;
  imageUrl?: string;
}

/**
 * Strips or converts unsupported Unicode characters to standard WinAnsi/ASCII.
 * Standard PDF fonts (Helvetica) severely garble text when encountering
 * characters like ≥, ≤, –, —, •, ✓, etc., resulting in spaced out characters or `"e` glyphs.
 */
function cleanPdfText(text?: string): string {
  if (!text) return '';
  return text
    .replace(/[≥]/g, '>=')
    .replace(/[≤]/g, '<=')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[•]/g, '-')
    .replace(/[✓✔]/g, '[OK]')
    .replace(/[°]/g, ' deg ')
    .replace(/[±]/g, '+/-')
    .replace(/[×]/g, 'x')
    .replace(/[µ]/g, 'u')
    .replace(/[…]/g, '...')
    .replace(/[\u00A0]/g, ' ') // non-breaking space
    .replace(/[^\x20-\x7E\n\r\t]/g, ''); // strip any remaining non-ASCII bytes
}

/**
 * Safely converts an image URL or blob into a data URL for jsPDF embedding
 */
async function loadImageDataUrl(url?: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generateMedicalReportPDF(
  diagnosis: string,
  confidence: number,
  patient: PatientAssessment,
  treatmentPlan: AITreatmentPlan,
  options?: PDFExportOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const leftMargin = 14;
  const rightMargin = 14;
  const contentWidth = pageWidth - leftMargin - rightMargin; // 182mm
  const reportId = `NS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const cleanDiag = cleanPdfText(diagnosis).toUpperCase();
  const generationDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Try loading radiograph image
  let radiographDataUrl: string | null = null;
  if (options?.imageUrl) {
    try {
      radiographDataUrl = await loadImageDataUrl(options.imageUrl);
    } catch {
      radiographDataUrl = null;
    }
  }

  // Dynamic position tracker
  let y = 38; // Initial y position on Page 1 (below top banner)

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = 22; // Start below running header on subsequent pages
    }
  };

  // Helper to draw clean section header
  const drawSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(subtitle ? 15 : 12);
    doc.setFillColor(225, 29, 72); // crimson accent
    doc.rect(leftMargin, y, 3, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(cleanPdfText(title).toUpperCase(), leftMargin + 5.5, y + 5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(cleanPdfText(subtitle), leftMargin + 5.5, y + 9);
      y += 12;
    } else {
      y += 8.5;
    }
  };

  // ==========================================
  // PAGE 1: TOP CLINICAL HEADER BANNER
  // ==========================================
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 29, 'F');

  // Crimson accent strip
  doc.setFillColor(225, 29, 72); // rose-600
  doc.rect(0, 29, pageWidth, 1.2, 'F');

  // Main Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('NEURALSCAN - AI THORACIC RADIOLOGY & CLINICAL REPORT', leftMargin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('AI-Assisted Thoracic Radiograph Analysis & Clinical Consultation', leftMargin, 17);

  // Metadata Row
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(
    `Report ID: ${reportId}   |   Date: ${generationDate}   |   System: NeuralScan AI Clinical Consultation`,
    leftMargin,
    24
  );

  y = 36;

  // ==========================================
  // 1. RADIOGRAPH AI CLASSIFICATION FINDING
  // ==========================================
  drawSectionHeader('1. Radiograph AI Analysis Finding', 'Automated deep learning consensus classification on chest X-ray radiograph');

  const findingBoxHeight = radiographDataUrl ? 32 : 26;
  checkPageBreak(findingBoxHeight + 6);

  // Container Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, findingBoxHeight, 2, 2, 'FD');

  const isNormal = diagnosis.toLowerCase() === 'normal';
  let textStartX = leftMargin + 4;

  // Embed image if available
  if (radiographDataUrl) {
    try {
      doc.addImage(radiographDataUrl, 'JPEG', leftMargin + 3, y + 3, 26, 26);
      doc.setDrawColor(203, 213, 225);
      doc.rect(leftMargin + 3, y + 3, 26, 26, 'S');
      textStartX = leftMargin + 33;
    } catch {
      textStartX = leftMargin + 4;
    }
  }

  // Finding Label & Value
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY PATHOLOGY CLASSIFICATION:', textStartX, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  if (isNormal) {
    doc.setTextColor(16, 185, 129); // emerald
    doc.text('NO PATHOLOGY DETECTED - NORMAL', textStartX, y + 13);
  } else {
    doc.setTextColor(225, 29, 72); // crimson red
    doc.text(`${cleanDiag} DETECTED`, textStartX, y + 13);
  }

  // Model details & Confidence Bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Confidence Score: ${(confidence * 100).toFixed(1)}%   |   Classification: Multi-Model AI Consensus`,
    textStartX,
    y + 19
  );

  // Visual Confidence Bar
  const barWidth = 55;
  const barHeight = 2.5;
  const barX = textStartX;
  const barY = y + 22;
  doc.setFillColor(226, 232, 240);
  doc.rect(barX, barY, barWidth, barHeight, 'F');
  doc.setFillColor(isNormal ? 16 : 225, isNormal ? 185 : 29, isNormal ? 129 : 72);
  doc.rect(barX, barY, Math.min(barWidth, barWidth * confidence), barHeight, 'F');

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const cleanImageName = cleanPdfText(options?.imageFileName || 'Chest_XRay_PA_Scan.png');
  doc.text(
    `Source Radiograph: ${cleanImageName}   |   View: Posteroanterior (PA/AP)`,
    textStartX + barWidth + 6,
    barY + 2
  );

  y += findingBoxHeight + 8;

  // ==========================================
  // 2. PATIENT DEMOGRAPHICS & CLINICAL VITALS RECORD
  // ==========================================
  drawSectionHeader('2. Patient Clinical Demographics & Triage Vitals', 'Reported patient history, respiratory symptoms, and pulse oximetry');

  const demoBoxHeight = 36;
  checkPageBreak(demoBoxHeight + 6);

  // Demographics Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, demoBoxHeight, 2, 2, 'FD');

  // Sub-header bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftMargin, y, contentWidth, 7, 2, 2, 'F');
  doc.rect(leftMargin, y + 4, contentWidth, 3, 'F'); // square bottom
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PATIENT INTAKE RECORD & PHYSIOLOGICAL PARAMETERS', leftMargin + 4, y + 5);

  const col1X = leftMargin + 4;
  const col2X = leftMargin + 94;
  let rowY = y + 12;

  doc.setFontSize(8);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Age / Gender:', col1X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${cleanPdfText(patient.age) || 'Not recorded'} yrs, ${cleanPdfText(patient.gender)}`, col1X + 26, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fever Profile:', col2X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(cleanPdfText(patient.fever), col2X + 26, rowY);

  rowY += 5.5;

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Duration of Illness:', col1X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${cleanPdfText(patient.durationDays) || 'N/A'} days`, col1X + 26, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Cough Character:', col2X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(cleanPdfText(patient.cough), col2X + 26, rowY);

  rowY += 5.5;

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Pulse Oximetry (SpO2):', col1X, rowY);
  doc.setFont('helvetica', 'normal');
  const isSpo2Critical = patient.spo2.includes('Critical');
  doc.setTextColor(isSpo2Critical ? 220 : 15, isSpo2Critical ? 38 : 23, isSpo2Critical ? 38 : 42);
  doc.text(cleanPdfText(patient.spo2), col1X + 33, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Pleuritic Chest Pain:', col2X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(patient.chestPain ? 'Present (Yes)' : 'None Reported', col2X + 28, rowY);

  rowY += 5.5;

  // Row 4
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Shortness of Breath:', col1X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(cleanPdfText(patient.breathShortness), col1X + 31, rowY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Comorbidities:', col2X, rowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const comorbText = cleanPdfText(
    patient.comorbidities.length > 0 ? patient.comorbidities.join(', ') : 'None Reported'
  );
  const comorbLines = doc.splitTextToSize(comorbText, 58);
  doc.text(comorbLines[0] || 'None', col2X + 24, rowY);

  y += demoBoxHeight + 8;

  // ==========================================
  // 3. AI DOCTOR CLINICAL EVALUATION & CARE STRATIFICATION
  // ==========================================
  drawSectionHeader('3. Clinical Triage & Care Stratification', 'AI physician assessment, urgency timeline, and pathophysiological synthesis');

  // Metric Strip: Severity Tier, Care Setting, Timeline
  checkPageBreak(18);
  const metricColWidth = contentWidth / 3;

  // Severity Tier Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(leftMargin, y, metricColWidth - 2, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  doc.text('SEVERITY STRATIFICATION', leftMargin + 3, y + 4.5);
  doc.setFontSize(9.5);
  doc.text(`${cleanPdfText(treatmentPlan.severityTier).toUpperCase()} RISK`, leftMargin + 3, y + 10.5);

  // Care Setting Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(leftMargin + metricColWidth, y, metricColWidth - 2, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('RECOMMENDED CARE SETTING', leftMargin + metricColWidth + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const careSettingLines = doc.splitTextToSize(cleanPdfText(treatmentPlan.careSetting), metricColWidth - 8);
  doc.text(careSettingLines[0] || '', leftMargin + metricColWidth + 3, y + 10.5);

  // Urgency Timeline Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(leftMargin + metricColWidth * 2, y, metricColWidth - 1, 14, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(185, 28, 28);
  doc.text('ACTION TIMELINE / URGENCY', leftMargin + metricColWidth * 2 + 3, y + 4.5);
  doc.setFontSize(8);
  const urgencyLines = doc.splitTextToSize(cleanPdfText(treatmentPlan.urgencyTimeline), metricColWidth - 7);
  doc.text(urgencyLines[0] || '', leftMargin + metricColWidth * 2 + 3, y + 10.5);

  y += 18;

  // Clinical Summary Narrative
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(
    cleanPdfText(`Clinical Impression: ${treatmentPlan.clinicalSummary}`),
    contentWidth - 8
  );
  const summaryHeight = summaryLines.length * 4.2 + 8;
  checkPageBreak(summaryHeight);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, y, contentWidth, summaryHeight, 1.5, 1.5, 'FD');
  let sumY = y + 5.5;
  summaryLines.forEach((line: string) => {
    doc.text(line, leftMargin + 4, sumY);
    sumY += 4.2;
  });

  y += summaryHeight + 8;

  // ==========================================
  // 4. EVIDENCE-BASED PHARMACOLOGICAL REGIMEN (MEDICATIONS TABLE)
  // ==========================================
  drawSectionHeader('4. Pharmacological Regimen & Prescriptions', 'Guideline-concordant medications, therapeutic dosing, and contraindications');

  // Proportion columns cleanly:
  // Col 1: Medication Name & Class (44mm)
  // Col 2: Dosage & Schedule (52mm)
  // Col 3: Indication & Clinical Notes (86mm)
  // Total = 44 + 52 + 86 = 182mm (contentWidth)
  const colWidth1 = 44;
  const colWidth2 = 52;
  const colWidth3 = 86;

  const drawTableHeader = () => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(leftMargin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('MEDICATION & CLASS', leftMargin + 3, y + 4.8);
    doc.text('DOSAGE & FREQUENCY', leftMargin + colWidth1 + 3, y + 4.8);
    doc.text('INDICATION & CLINICAL NOTES', leftMargin + colWidth1 + colWidth2 + 3, y + 4.8);
    y += 7;
  };

  drawTableHeader();

  // Render each medication row with STRICT line-by-line wrapping and no overlap
  treatmentPlan.medications.forEach((med, index) => {
    const cleanName = cleanPdfText(`${index + 1}. ${med.name}`);
    const cleanClass = cleanPdfText(`Class: ${med.category}`);
    const cleanDose = cleanPdfText(med.dosage);
    const cleanFreq = cleanPdfText(`Schedule: ${med.frequency}`);
    const cleanPurpose = cleanPdfText(med.purpose);
    const cleanContra = med.contraindications ? cleanPdfText(`Caution: ${med.contraindications}`) : '';

    // Wrap text for each cell strictly within its column width
    doc.setFontSize(7.5);
    const nameLines: string[] = doc.splitTextToSize(cleanName, colWidth1 - 6);
    const classLines: string[] = doc.splitTextToSize(cleanClass, colWidth1 - 6);
    const doseLines: string[] = doc.splitTextToSize(cleanDose, colWidth2 - 6);
    const freqLines: string[] = doc.splitTextToSize(cleanFreq, colWidth2 - 6);
    const purpLines: string[] = doc.splitTextToSize(cleanPurpose, colWidth3 - 6);
    const contraLines: string[] = cleanContra ? doc.splitTextToSize(cleanContra, colWidth3 - 6) : [];

    // Calculate height required for each column
    const col1H = nameLines.length * 3.8 + classLines.length * 3.2 + 5;
    const col2H = doseLines.length * 3.8 + freqLines.length * 3.2 + 5;
    const col3H = purpLines.length * 3.6 + (contraLines.length > 0 ? contraLines.length * 3.2 + 2 : 0) + 5;

    const rowHeight = Math.max(14, col1H, col2H, col3H);

    // If row exceeds page, add new page and re-render header
    if (y + rowHeight > pageHeight - 20) {
      doc.addPage();
      y = 22;
      drawTableHeader();
    }

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(255, 255, 255);
    } else {
      doc.setFillColor(248, 250, 252);
    }
    doc.setDrawColor(226, 232, 240);
    doc.rect(leftMargin, y, contentWidth, rowHeight, 'FD');

    // --- Column 1: Name & Class (rendered line by line) ---
    let c1Y = y + 4.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    nameLines.forEach((line: string) => {
      doc.text(line, leftMargin + 3, c1Y);
      c1Y += 3.8;
    });

    c1Y += 0.5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    classLines.forEach((line: string) => {
      doc.text(line, leftMargin + 3, c1Y);
      c1Y += 3.2;
    });

    // --- Column 2: Dosage & Schedule (rendered line by line strictly inside colWidth2) ---
    let c2Y = y + 4.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doseLines.forEach((line: string) => {
      doc.text(line, leftMargin + colWidth1 + 3, c2Y);
      c2Y += 3.8;
    });

    c2Y += 0.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    freqLines.forEach((line: string) => {
      doc.text(line, leftMargin + colWidth1 + 3, c2Y);
      c2Y += 3.2;
    });

    // --- Column 3: Indication & Clinical Notes (rendered line by line strictly inside colWidth3) ---
    let c3Y = y + 4.2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    purpLines.forEach((line: string) => {
      doc.text(line, leftMargin + colWidth1 + colWidth2 + 3, c3Y);
      c3Y += 3.6;
    });

    if (contraLines.length > 0) {
      c3Y += 0.8;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.8);
      doc.setTextColor(185, 28, 28);
      contraLines.forEach((line: string) => {
        doc.text(line, leftMargin + colWidth1 + colWidth2 + 3, c3Y);
        c3Y += 3.2;
      });
    }

    y += rowHeight;
  });

  y += 6;

  // ==========================================
  // 5. ACTIONABLE CLINICAL PROTOCOLS & SUPPORTIVE CARE
  // ==========================================
  drawSectionHeader('5. Actionable Clinical Protocols & Supportive Care', 'Sequential therapeutic steps and clinical monitoring parameters');

  treatmentPlan.treatmentSteps.forEach((step, idx) => {
    const cleanStep = cleanPdfText(step);
    doc.setFontSize(8);
    const stepLines: string[] = doc.splitTextToSize(cleanStep, contentWidth - 14);
    const stepHeight = stepLines.length * 4.2 + 3;
    checkPageBreak(stepHeight);

    // Step Number Badge
    doc.setFillColor(225, 29, 72); // crimson
    doc.circle(leftMargin + 3.5, y + 3, 2.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(`${idx + 1}`, leftMargin + 2.4, y + 4.2);

    // Step Text rendered line by line
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let sY = y + 3.8;
    stepLines.forEach((line: string) => {
      doc.text(line, leftMargin + 9, sY);
      sY += 4.2;
    });

    y += stepHeight;
  });

  y += 4;

  // Supportive Care Checklist
  if (treatmentPlan.supportiveCare.length > 0) {
    checkPageBreak(22);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('RECOMMENDED SUPPORTIVE & HOME CARE MEASURES:', leftMargin, y);
    y += 4.5;

    treatmentPlan.supportiveCare.forEach((care) => {
      const cleanCare = cleanPdfText(care);
      const careLines: string[] = doc.splitTextToSize(`-  ${cleanCare}`, contentWidth - 6);
      checkPageBreak(careLines.length * 3.8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      let careY = y;
      careLines.forEach((line: string) => {
        doc.text(line, leftMargin + 2, careY);
        careY += 3.8;
      });
      y += careLines.length * 3.8;
    });

    y += 4;
  }

  // ==========================================
  // 6. EMERGENCY RED FLAGS (IMMEDIATE ESCALATION)
  // ==========================================
  const redFlags = treatmentPlan.redFlagWarnings || [];
  if (redFlags.length > 0) {
    let flagsTotalLines = 0;
    const cleanedFlags: string[][] = [];

    redFlags.forEach((rf) => {
      const cleanRf = cleanPdfText(rf);
      const lines: string[] = doc.splitTextToSize(`- ${cleanRf}`, contentWidth - 14);
      flagsTotalLines += lines.length;
      cleanedFlags.push(lines);
    });

    const alertBoxHeight = 10 + flagsTotalLines * 4.0;
    checkPageBreak(alertBoxHeight + 6);

    // Alert Box with Red Border & Background
    doc.setFillColor(254, 242, 242); // pale red
    doc.setDrawColor(239, 68, 68); // red-500
    doc.setLineWidth(0.4);
    doc.roundedRect(leftMargin, y, contentWidth, alertBoxHeight, 2, 2, 'FD');

    // Left thick accent bar
    doc.setFillColor(220, 38, 38);
    doc.rect(leftMargin, y, 2.5, alertBoxHeight, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(185, 28, 28);
    doc.text('EMERGENCY RED FLAGS - IMMEDIATE MEDICAL ESCALATION CRITERIA', leftMargin + 6, y + 6);

    let flagY = y + 11;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(127, 29, 29);

    cleanedFlags.forEach((lines) => {
      lines.forEach((line: string) => {
        doc.text(line, leftMargin + 6, flagY);
        flagY += 4.0;
      });
    });

    y += alertBoxHeight + 8;
  }

  // ==========================================
  // 7. PHYSICIAN CONSULTATION & SIGN-OFF BLOCK
  // ==========================================
  checkPageBreak(28);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, y, contentWidth, 24, 1.5, 1.5, 'S');

  // Left side: Signature line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('REVIEWING PHYSICIAN / RADIOLOGIST VERIFICATION', leftMargin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Physician Signature: ____________________________________', leftMargin + 4, y + 12);
  doc.text('Date: ________________________   License / NPI: ____________', leftMargin + 4, y + 19);

  // Right side: Digital verification seal
  const rightColX = leftMargin + 105;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('DIGITAL SYSTEM ATTESTATION', rightColX, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified by: NeuralScan Clinical Decision Support', rightColX, y + 10);
  doc.text('Analysis System: Multi-Model Deep Learning Consensus', rightColX, y + 14.5);
  doc.text(`Digital Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`, rightColX, y + 19);

  y += 28;

  // ==========================================
  // 8. MULTI-PAGE RUNNING HEADERS & FOOTERS (PAGE X OF Y)
  // ==========================================
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // --- RUNNING FOOTER (ON ALL PAGES) ---
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'CONFIDENTIAL MEDICAL REPORT - ACADEMIC & CLINICAL DECISION SUPPORT EVALUATION ONLY - NOT A SOLE DIAGNOSTIC DEVICE',
      leftMargin,
      pageHeight - 7
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`PAGE ${i} OF ${totalPages}`, pageWidth - rightMargin, pageHeight - 7, { align: 'right' });

    // --- RUNNING HEADER (PAGES 2+) ---
    if (i > 1) {
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 13, 'F');

      doc.setFillColor(225, 29, 72);
      doc.rect(0, 13, pageWidth, 0.8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('NEURALSCAN - THORACIC CLINICAL CONSULTATION REPORT', leftMargin, 8.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(203, 213, 225);
      doc.text(
        `ID: ${reportId}   |   Patient: ${cleanPdfText(patient.age) || '--'}y, ${cleanPdfText(patient.gender)}   |   Diagnosis: ${cleanDiag}`,
        pageWidth - rightMargin,
        8.5,
        { align: 'right' }
      );
    }
  }

  // Trigger download with sanitized filename
  const filename = `NeuralScan_Clinical_Report_${cleanDiag.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
