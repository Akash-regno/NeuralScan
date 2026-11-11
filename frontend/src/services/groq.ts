export interface PatientAssessment {
  age: string;
  gender: string;
  durationDays: string;
  fever: 'None' | 'Mild (99-101°F)' | 'High (>101°F)';
  cough: 'None' | 'Mild Dry Cough' | 'Persistent Wet/Productive' | 'Blood-Tinged / Hemoptysis';
  spo2: 'Normal (>95%)' | 'Borderline (91-94%)' | 'Critical (<90%)';
  breathShortness: 'None' | 'Only on exertion' | 'At rest / Severe';
  chestPain: boolean;
  comorbidities: string[];
  currentMedications: string;
}

export interface MedicationRecommendation {
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  purpose: string;
  contraindications: string;
}

export interface AITreatmentPlan {
  severityTier: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  careSetting: string;
  urgencyTimeline: string;
  clinicalSummary: string;
  treatmentSteps: string[];
  medications: MedicationRecommendation[];
  supportiveCare: string[];
  monitoringParameters: string[];
  redFlagWarnings: string[];
  disclaimer: string;
}

export const getStoredGroqApiKey = (): string => {
  return (
    import.meta.env.VITE_GROQ_API_KEY ||
    localStorage.getItem('neuralscan_groq_api_key') ||
    ''
  );
};

export const setStoredGroqApiKey = (key: string): void => {
  if (key) {
    localStorage.setItem('neuralscan_groq_api_key', key.trim());
  } else {
    localStorage.removeItem('neuralscan_groq_api_key');
  }
};

export async function generateAITreatmentPlan(
  diagnosis: string,
  confidence: number,
  patient: PatientAssessment,
  customApiKey?: string
): Promise<AITreatmentPlan> {
  const apiKey = (customApiKey || getStoredGroqApiKey()).trim();

  // If no Groq API Key is available, return the high-fidelity evidence-based protocol
  if (!apiKey) {
    return generateEvidenceBasedFallback(diagnosis, confidence, patient);
  }

  const systemPrompt = `You are Dr. NeuralScan, an expert Pulmonology & Thoracic Medicine AI clinical consultant.
You evaluate chest X-ray findings from deep learning ResNet50 models along with patient clinical triage data.
Provide comprehensive, evidence-based clinical recommendations, standard medical treatments, pharmacological therapies, and clear referral urgency.

You MUST reply with ONLY a single valid JSON object strictly matching this schema with NO markdown code fences, NO introductory text, and NO trailing text:
{
  "severityTier": "Mild" | "Moderate" | "Severe" | "Critical",
  "careSetting": "string describing recommended facility (e.g. Home Isolation, Outpatient Pulmonology, Emergency Room)",
  "urgencyTimeline": "string describing when to see a doctor (e.g. Within 2-4 hours, Immediate ER)",
  "clinicalSummary": "detailed paragraph analyzing the combination of X-Ray findings and reported symptoms",
  "treatmentSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "medications": [
    {
      "name": "Medication generic name and common brand",
      "category": "e.g. Antibiotic / Antiviral / Corticosteroid / Bronchodilator / Antipyretic",
      "dosage": "standard adult dosage recommendation",
      "frequency": "how often to administer",
      "purpose": "clinical rationale",
      "contraindications": "warnings, allergies, or drug interactions to check"
    }
  ],
  "supportiveCare": ["supportive measure 1", "measure 2", "measure 3"],
  "monitoringParameters": ["vital or parameter to check 1", "parameter 2"],
  "redFlagWarnings": ["red flag symptom 1", "red flag 2", "red flag 3"],
  "disclaimer": "Medical disclaimer explicitly stating all treatments must be verified by a licensed physician before administration."
}`;

  const userContent = `Patient Clinical Case Details:
- ResNet50 Neural Model Primary Classification: ${diagnosis} (${(confidence * 100).toFixed(1)}% confidence)
- Patient Demographics: Age ${patient.age || 'Adult'}, Biological Sex: ${patient.gender}
- Duration of Symptoms: ${patient.durationDays || 'Recent'} days
- Temperature/Fever Status: ${patient.fever}
- Cough Assessment: ${patient.cough}
- Pulse Oximetry / SpO2: ${patient.spo2}
- Dyspnea / Shortness of Breath: ${patient.breathShortness}
- Pleuritic Chest Pain: ${patient.chestPain ? 'Present' : 'Absent'}
- Pre-existing Comorbidities: ${patient.comorbidities.length > 0 ? patient.comorbidities.join(', ') : 'None reported'}
- Current Concomitant Medications: ${patient.currentMedications || 'None'}

Generate a structured, evidence-based treatment protocol with standard pharmacological guidelines according to WHO/ATS/IDSA medical standards.`;

  const candidateModels = [
    'openai/gpt-oss-120b',
    'groq/compound',
    'qwen/qwen3.8-27b',
    'groq/compound-mini',
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (rawContent) {
          const parsed: AITreatmentPlan = JSON.parse(rawContent);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`Attempt with ${model} failed, trying next candidate:`, err);
    }
  }

  // If network is completely offline or API unreachable, use evidence-based medical matrix
  return generateEvidenceBasedFallback(diagnosis, confidence, patient);
}

/**
 * Built-in Medical Protocol Matrix
 * Derived from WHO, CDC, ATS & IDSA Thoracic Medicine Guidelines
 */
export function generateEvidenceBasedFallback(
  diagnosis: string,
  confidence: number,
  patient: PatientAssessment
): AITreatmentPlan {
  const normDiag = diagnosis.toLowerCase();
  const isHighFever = patient.fever.includes('High');
  const isHypoxic = patient.spo2.includes('Critical') || patient.spo2.includes('Borderline');
  const isSevereDyspnea = patient.breathShortness.includes('At rest');

  let severity: 'Mild' | 'Moderate' | 'Severe' | 'Critical' = 'Moderate';
  if (isHypoxic || isSevereDyspnea || patient.cough.includes('Blood')) {
    severity = 'Critical';
  } else if (isHighFever || patient.chestPain) {
    severity = 'Severe';
  } else if (normDiag === 'normal' && !isHighFever && !patient.chestPain) {
    severity = 'Mild';
  }

  if (normDiag.includes('covid')) {
    return {
      severityTier: severity,
      careSetting: severity === 'Critical' ? 'Immediate Emergency Department / ICU' : 'Dedicated Home Isolation & Telemedicine Monitoring',
      urgencyTimeline: severity === 'Critical' ? 'Immediate emergency medical attention (Call Emergency Services)' : 'Consult primary physician within 12-24 hours',
      clinicalSummary: `The ResNet50 visual deep neural network detected features consistent with COVID-19 with ${(confidence * 100).toFixed(1)}% confidence. Given symptom duration of ${patient.durationDays || 'several'} days and reported vitals, management focuses on viral symptom control, respiratory support, and monitoring inflammatory cascade progression.`,
      treatmentSteps: [
        'Strict airborne isolation for a minimum of 5-10 days following onset of symptoms.',
        'Continuous pulse oximetry monitoring every 4-6 hours; record all readings in a symptom log.',
        'Prone positioning (lying on abdomen) 2-4 hours twice daily to optimize posterior lung perfusion.',
        'Oral hydration (2.5 - 3 liters daily) and electrolyte replenishment unless fluid-restricted.',
        'Immediate medical escalation if oxygen drops below 92% on room air or if confusion arises.',
      ],
      medications: [
        {
          name: 'Nirmatrelvir with Ritonavir (Paxlovid)',
          category: 'Oral Protease Inhibitor Antiviral',
          dosage: '300 mg nirmatrelvir with 100 mg ritonavir twice daily',
          frequency: 'Every 12 hours for 5 days',
          purpose: 'Inhibits SARS-CoV-2 viral replication; indicated for mild-to-moderate high-risk patients within 5 days of symptom onset.',
          contraindications: 'Requires renal function assessment (eGFR); contraindicated with strong CYP3A inducers like rifampin or St. John\'s wort.',
        },
        {
          name: 'Acetaminophen / Paracetamol',
          category: 'Antipyretic & Analgesic',
          dosage: '500 mg - 650 mg orally',
          frequency: 'Every 4-6 hours as needed (Maximum 3,000 mg/24 hours)',
          purpose: 'Manages febrile episodes, body aches, and persistent headaches.',
          contraindications: 'Severe hepatic impairment; monitor total daily acetaminophen from all multi-symptom products.',
        },
        {
          name: 'Budesonide (Inhaled)',
          category: 'Topical Corticosteroid Inhaler',
          dosage: '800 mcg twice daily via dry powder inhaler',
          frequency: 'Every 12 hours for up to 14 days',
          purpose: 'Reduces localized bronchial inflammation and accelerates recovery time.',
          contraindications: 'Rinse mouth after inhalation to prevent oral candidiasis.',
        },
        {
          name: 'Guaifenesin / Dextromethorphan',
          category: 'Expectorant & Cough Suppressant',
          dosage: '400 mg / 20 mg oral solution or tablet',
          frequency: 'Every 4-6 hours as needed',
          purpose: 'Mobilizes bronchial secretions and relieves debilitating dry nocturnal cough.',
          contraindications: 'Do not combine with MAO inhibitors.',
        },
      ],
      supportiveCare: [
        'Awake prone positioning: 30-120 minutes several times per day.',
        'Warm steam inhalation or cool-mist humidifier to ease upper airway irritation.',
        'Rest with head elevated 30-45 degrees to ease diaphragmatic excursion.',
      ],
      monitoringParameters: [
        'Oxygen Saturation (SpO2): Target >= 94% on room air.',
        'Body Temperature: Target < 100.4°F (38°C).',
        'Respiratory Rate: Target 12-20 breaths per minute at rest.',
      ],
      redFlagWarnings: [
        'SpO2 reading falling to 92% or lower at rest.',
        'Persistent pain or pressure in the chest.',
        'New confusion, inability to wake, or blueish discoloration of lips/face (cyanosis).',
      ],
      disclaimer: 'This treatment strategy represents an academic clinical decision support demonstration. Prescriptions and active antiviral therapy require physician review and verification.',
    };
  }

  if (normDiag.includes('tuberculosis')) {
    return {
      severityTier: severity === 'Mild' ? 'Moderate' : severity,
      careSetting: 'Specialized Pulmonology & Directly Observed Therapy (DOTS) Clinic',
      urgencyTimeline: 'Schedule urgent infectious disease / pulmonary consultation within 24-48 hours',
      clinicalSummary: `The chest radiograph exhibited radiographic patterns correlating with Tuberculosis (${(confidence * 100).toFixed(1)}% model confidence). Given the clinical history of ${patient.cough} and ${patient.durationDays} days of symptoms, immediate sputum acid-fast bacilli (AFB) smear and GeneXpert MTB/RIF molecular testing are indicated before starting fixed-dose combination therapy.`,
      treatmentSteps: [
        'Immediate airborne precautions: Patient should wear a surgical mask in public and stay in well-ventilated rooms.',
        'Diagnostic confirmation: Collect 3 consecutive morning sputum samples for AFB microscopy and GeneXpert mycobacterial testing.',
        'Baseline laboratory testing: Complete blood count, baseline hepatic transaminases (ALT/AST), bilirubin, and serum creatinine.',
        'Directly Observed Therapy (DOTS): Initiate standardized four-drug intensive phase upon microbiological confirmation.',
        'Screening household and close contacts for latent TB infection (TST or IGRA).',
      ],
      medications: [
        {
          name: 'Isoniazid (INH)',
          category: 'First-Line Antimycobacterial',
          dosage: '300 mg daily (or 5 mg/kg)',
          frequency: 'Once daily on an empty stomach',
          purpose: 'Bactericidal against actively replicating intra- and extracellular Mycobacterium tuberculosis.',
          contraindications: 'Active acute liver disease; co-prescribe Pyridoxine (Vitamin B6) 25-50 mg daily to prevent peripheral neuropathy.',
        },
        {
          name: 'Rifampin (RIF)',
          category: 'Rifamycin Class Antimycobacterial',
          dosage: '600 mg daily (or 10 mg/kg)',
          frequency: 'Once daily 1 hour before or 2 hours after meals',
          purpose: 'Potent bactericidal sterilizing agent targeting persistent bacilli.',
          contraindications: 'Strong inducer of cytochrome P450; alters clearance of oral contraceptives, anticoagulants, and antiretrovirals. Colors urine/tears orange.',
        },
        {
          name: 'Pyrazinamide (PZA)',
          category: 'First-Line Antimycobacterial',
          dosage: '1500 mg - 2000 mg daily (based on weight band)',
          frequency: 'Once daily with meals',
          purpose: 'Kills semi-dormant bacilli in acidic intracellular macrophage environments during the first 2 months of therapy.',
          contraindications: 'Severe liver damage or acute clinical gout (causes hyperuricemia).',
        },
        {
          name: 'Ethambutol (EMB)',
          category: 'Bacteriostatic Antimycobacterial',
          dosage: '1200 mg - 1600 mg daily (15-20 mg/kg)',
          frequency: 'Once daily',
          purpose: 'Inhibits arabinosyl transferase to prevent mycobacterial cell wall synthesis and prevents emergence of drug resistance.',
          contraindications: 'Requires baseline visual acuity and color vision (red-green) screening due to potential optic neuritis.',
        },
        {
          name: 'Pyridoxine (Vitamin B6)',
          category: 'Neuroprotective Nutritional Co-factor',
          dosage: '25 mg - 50 mg daily',
          frequency: 'Once daily with Isoniazid',
          purpose: 'Protects against INH-induced pyridoxine depletion and peripheral sensory neuropathy.',
          contraindications: 'Well tolerated with no significant contraindications at therapeutic replacement doses.',
        },
      ],
      supportiveCare: [
        'High-protein, high-calorie nutritional supplementation to reverse TB-associated cachexia.',
        'Well-ventilated sleeping quarters with direct sunlight exposure to accelerate droplet nuclei clearance.',
        'Avoidance of all alcohol consumption throughout the 6-month treatment course to mitigate hepatotoxicity.',
      ],
      monitoringParameters: [
        'Monthly sputum AFB smear and culture conversion.',
        'Liver Function Tests (ALT, AST, Total Bilirubin) at 2, 4, 8, and 12 weeks.',
        'Visual acuity testing monthly for patients receiving Ethambutol.',
      ],
      redFlagWarnings: [
        'Coughing up frank blood or large volume hemoptysis (>100 mL/24h).',
        'Jaundice (yellowing of skin/eyes), persistent nausea, or dark urine indicating drug-induced hepatotoxicity.',
        'Sudden decrease in visual acuity or inability to differentiate red and green colors.',
      ],
      disclaimer: 'Tuberculosis requires confirmation via sputum microbiology and strict adherence to a multi-month DOTS protocol overseen by a licensed infectious disease specialist.',
    };
  }

  if (normDiag.includes('pneumonia')) {
    return {
      severityTier: severity,
      careSetting: severity === 'Critical' ? 'Inpatient Hospitalization / Pulmonology Ward' : 'Outpatient Primary Care Clinic',
      urgencyTimeline: severity === 'Critical' ? 'Emergency evaluation within 1 hour' : 'Physician consultation within 6-12 hours for antibiotic prescription',
      clinicalSummary: `The ResNet50 neural model detected radiographic alveolar consolidation or bronchopneumonic infiltrates with ${(confidence * 100).toFixed(1)}% confidence. In conjunction with ${patient.fever} and ${patient.cough}, standard empiric antimicrobial therapy targeting Community-Acquired Pneumonia (CAP) is warranted following physician evaluation.`,
      treatmentSteps: [
        'Physician assessment using clinical risk scoring (CURB-65 or Pneumonia Severity Index PSI).',
        'Prompt initiation of empiric antibiotic therapy within 4-6 hours of clinical presentation.',
        'Respiratory physiotherapy: Incentive spirometry (10 breaths every hour while awake) to open collapsed alveoli.',
        'Maintain oral hydration to facilitate mucociliary clearance of bronchial secretions.',
        'Re-evaluate clinical response at 48-72 hours (temperature defervescence, reduction in dyspnea).',
      ],
      medications: [
        {
          name: 'Amoxicillin-Clavulanate (Augmentin)',
          category: 'Beta-Lactam + Beta-Lactamase Inhibitor',
          dosage: '875 mg / 125 mg orally twice daily',
          frequency: 'Every 12 hours with meals for 5-7 days',
          purpose: 'First-line bactericidal coverage against Streptococcus pneumoniae and Haemophilus influenzae.',
          contraindications: 'Penicillin allergy; history of amoxicillin/clavulanate-associated hepatic dysfunction.',
        },
        {
          name: 'Azithromycin (Zithromax)',
          category: 'Macrolide Antibiotic',
          dosage: '500 mg on day 1, then 250 mg daily on days 2-5',
          frequency: 'Once daily for 5 days total',
          purpose: 'Atypical coverage against Mycoplasma pneumoniae, Chlamydia pneumoniae, and Legionella pneumophila.',
          contraindications: 'Known QT interval prolongation; caution with concurrent antiarrhythmic medications.',
        },
        {
          name: 'Doxycycline (Alternative for Penicillin Allergy)',
          category: 'Tetracycline Class Antibiotic',
          dosage: '100 mg orally twice daily',
          frequency: 'Every 12 hours for 5-7 days',
          purpose: 'Provides broad-spectrum coverage for both typical and atypical respiratory pathogens in penicillin-allergic individuals.',
          contraindications: 'Pregnancy; children under 8 years; avoid co-administration with antacids, iron, or calcium.',
        },
        {
          name: 'Albuterol / Salbutamol Inhaler',
          category: 'Short-Acting Beta-2 Agonist Bronchodilator',
          dosage: '90 mcg/actuation (2 puffs via spacer)',
          frequency: 'Every 4-6 hours as needed for wheezing or bronchospasm',
          purpose: 'Relaxes bronchial smooth muscle to reduce airway resistance and ease work of breathing.',
          contraindications: 'Caution in severe tachyarrhythmias; temporary tremor or palpitations may occur.',
        },
        {
          name: 'Ibuprofen or Acetaminophen',
          category: 'NSAID / Antipyretic',
          dosage: 'Ibuprofen 400 mg or Acetaminophen 500 mg',
          frequency: 'Every 6-8 hours with food as needed',
          purpose: 'Alleviates pleuritic chest discomfort and reduces high-grade fevers.',
          contraindications: 'Avoid NSAIDs in active peptic ulcer disease, severe renal insufficiency, or severe heart failure.',
        },
      ],
      supportiveCare: [
        'Incentive spirometry device exercises: 10 breaths every waking hour.',
        'Postural drainage and gentle percussion to mobilize lower lobe secretions.',
        'Cool-mist humidification to prevent drying of upper respiratory mucous membranes.',
      ],
      monitoringParameters: [
        'Pulse oximetry (SpO2): Must remain >= 93% on room air.',
        'Resting Respiratory Rate: Monitor for tachypnea (>24 breaths/min).',
        'Defervescence of fever: Expect temperature normalization within 48 to 72 hours of targeted antimicrobial therapy.',
      ],
      redFlagWarnings: [
        'Inability to maintain SpO2 above 92% despite resting and deep breathing.',
        'Confusion, lethargy, or inability to take oral fluids/medications.',
        'Systolic blood pressure dropping below 90 mmHg or heart rate exceeding 120 bpm at rest.',
      ],
      disclaimer: 'Pneumonia requires definitive clinical evaluation and auscultation by a healthcare provider. Antibiotics must be prescribed following an in-person or formal telemedicine consultation.',
    };
  }

  // Normal Radiograph with reported symptoms
  return {
    severityTier: severity === 'Critical' ? 'Severe' : 'Mild',
    careSetting: 'Primary Care Outpatient Clinic or Telemedicine Follow-Up',
    urgencyTimeline: 'Routine primary care appointment within 3-5 days if symptoms persist',
    clinicalSummary: `The ResNet50 neural network detected no acute consolidations, focal lesions, or overt pathological infiltrates, classifying the radiograph as Normal with ${(confidence * 100).toFixed(1)}% confidence. Given reported symptoms (${patient.cough}, ${patient.fever}), care centers on symptomatic relief, monitoring for latent progression, and ruling out non-parenchymal conditions (bronchitis, upper respiratory infection, or allergic airway hyperactivity).`,
    treatmentSteps: [
      'Symptomatic management for upper airway irritation or non-infiltrative viral tracheobronchitis.',
      'Maintain robust oral fluid intake (water, warm broths, herbal teas) to soothe mucosal lining.',
      'Avoid environmental bronchial irritants (cigarette smoke, vaping, harsh aerosols, and dust).',
      'If cough or low-grade fever persists beyond 10-14 days, follow up for repeat clinical evaluation.',
    ],
    medications: [
      {
        name: 'Dextromethorphan HBr',
        category: 'Centrally Acting Antitussive',
        dosage: '15 mg - 30 mg orally',
        frequency: 'Every 6-8 hours as needed (Maximum 120 mg/day)',
        purpose: 'Suppresses non-productive, irritating dry cough that interferes with restorative sleep.',
        contraindications: 'Do not use within 14 days of taking MAO inhibitors.',
      },
      {
        name: 'Fluticasone Propionate Nasal Spray',
        category: 'Intranasal Corticosteroid',
        dosage: '50 mcg/spray (2 sprays per nostril once daily)',
        frequency: 'Once daily in the morning',
        purpose: 'Reduces post-nasal drip and allergic rhinitis that triggers reflexive lower airway coughing.',
        contraindications: 'Recent nasal trauma or active untreated nasal septal ulceration.',
      },
      {
        name: 'Cetirizine or Loratadine',
        category: 'Second-Generation Antihistamine',
        dosage: '10 mg orally once daily',
        frequency: 'Once daily (preferably evening for cetirizine)',
        purpose: 'Counters histamine-mediated mucosal congestion, allergic cough, and rhinorrhea without heavy sedation.',
        contraindications: 'Severe renal impairment (requires dose adjustment).',
      },
      {
        name: 'Honey and Lemon Throat Lozenges',
        category: 'Demulcent & Mucosal Soother',
        dosage: '1 lozenge dissolved slowly in mouth',
        frequency: 'Every 2-3 hours as needed',
        purpose: 'Provides protective barrier over pharyngeal nerve endings to suppress dry tickling cough.',
        contraindications: 'Avoid raw honey in infants under 12 months old.',
      },
    ],
    supportiveCare: [
      'Warm saline gargles (1/2 teaspoon salt in 8 oz warm water) 3-4 times daily.',
      'Bedroom cool-mist humidifier running overnight to prevent mucosal drying.',
      'Elevate head with two pillows to minimize nocturnal post-nasal drainage.',
    ],
    monitoringParameters: [
      'Resolution of dry cough within 7 to 10 days.',
      'Absence of new fever spikes (>100.4°F / 38°C).',
      'Normal breathing effort during ordinary daily activities.',
    ],
    redFlagWarnings: [
      'Development of acute shortness of breath or inability to complete full sentences without pausing.',
      'Appearance of yellow/green thick purulent sputum or blood in phlegm.',
      'New onset of focal sharp chest pain that worsens on deep inspiration.',
    ],
    disclaimer: 'A normal radiograph rules out significant parenchymal consolidation but does not preclude early-stage infections, asthma, or bronchitis. Consult a physician if symptoms escalate.',
  };
}
