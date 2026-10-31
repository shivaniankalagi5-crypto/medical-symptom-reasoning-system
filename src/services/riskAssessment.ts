/**
 * Risk Assessment Engine (TypeScript).
 * Evaluates predefined clinical red flags (chest pain, syncope, cyanosis, seizures, etc.)
 * Assigns informational guidance tiers (URGENT MEDICAL ATTENTION vs MODERATE vs LOW).
 */

import { ExtractedSymptom } from "./symptomExtractor";

export interface WarningTrigger {
  symptom_id: string;
  symptom_name: string;
  clinical_concern: string;
}

export interface RiskResult {
  level: "URGENT MEDICAL ATTENTION" | "MODERATE" | "LOW";
  badge_color: "red" | "amber" | "green";
  has_urgent_warning: boolean;
  triggered_warnings: WarningTrigger[];
  summary_message: string;
  guidance: string;
  disclaimer: string;
}

const URGENT_WARNING_SYMPTOMS: Record<string, { name: string; reason: string }> = {
  SYM22: {
    name: "Loss of consciousness",
    reason: "Sudden loss of awareness (syncope) may indicate critical cardiovascular or neurological compromise."
  },
  SYM23: {
    name: "Seizure",
    reason: "Sudden unprovoked epileptic or convulsive episodes require urgent acute medical workup."
  },
  SYM24: {
    name: "Severe confusion",
    reason: "Acute delirium or disorientation can signal intracranial, metabolic, or severe septic disturbance."
  },
  SYM25: {
    name: "Severe bleeding",
    reason: "Uncontrolled active hemorrhage presents an immediate risk of hypovolemic compromise."
  },
  SYM26: {
    name: "Blue or grey lips or face",
    reason: "Cyanosis indicates severe hypoxemia or acute respiratory/circulatory insufficiency."
  },
  SYM19: {
    name: "Shortness of breath",
    reason: "Reported breathing difficulty or acute dyspnea may indicate critical lower airway or cardiorespiratory distress."
  },
  SYM20: {
    name: "Chest pain",
    reason: "Thoracic discomfort or acute chest pressure requires urgent clinical and ECG exclusion of acute coronary/thoracic syndromes."
  }
};

const URGENT_TEXT_KEYWORDS = [
  "chest pain", "tight chest", "chest pressure", "heart attack",
  "can't breathe", "struggling to breathe", "cannot breathe", "gasping for air",
  "passed out", "blacked out", "fainted", "unconscious",
  "seizure", "convulsions", "fits",
  "delirium", "hallucinating", "severe confusion",
  "heavy bleeding", "gushing blood", "uncontrolled bleeding",
  "blue lips", "grey lips", "blue face", "cyanosis"
];

export function evaluateRisk(
  detectedSymptoms: ExtractedSymptom[],
  rawNarrative: string = "",
  duration: string = "",
  severity: string = ""
): RiskResult {
  const detectedIds = new Set(detectedSymptoms.map((s) => s.symptom_id));
  const triggered: WarningTrigger[] = [];

  // Check structured symptoms
  for (const [symId, info] of Object.entries(URGENT_WARNING_SYMPTOMS)) {
    if (detectedIds.has(symId)) {
      triggered.push({
        symptom_id: symId,
        symptom_name: info.name,
        clinical_concern: info.reason
      });
    }
  }

  // Check free text keywords
  const lowerText = rawNarrative.toLowerCase();
  for (const kw of URGENT_TEXT_KEYWORDS) {
    if (lowerText.includes(kw)) {
      const alreadyIncluded = triggered.some((w) =>
        w.symptom_name.toLowerCase().includes(kw) || w.clinical_concern.toLowerCase().includes(kw)
      );
      if (!alreadyIncluded) {
        triggered.push({
          symptom_id: "KEYWORD_FLAG",
          symptom_name: `Warning phrase: "${kw}"`,
          clinical_concern: "Free-text description contains language corresponding to an acute clinical warning sign."
        });
      }
    }
  }

  const isUrgent = triggered.length > 0 || severity === "Severe";
  const isModerate = severity === "Moderate" || ["3–7 days", "More than 1 week"].includes(duration) || detectedSymptoms.length >= 4;

  let level: RiskResult["level"] = "LOW";
  let badge_color: RiskResult["badge_color"] = "green";
  let summary_message = "";
  let guidance = "";

  if (isUrgent) {
    level = "URGENT MEDICAL ATTENTION";
    badge_color = "red";
    summary_message = "Some of the symptoms you reported may require prompt professional evaluation. Please seek appropriate medical or emergency care.";
    guidance = "Do not wait for symptoms to resolve on their own. Urgent evaluation by a healthcare professional or emergency care facility is strongly recommended.";
  } else if (isModerate) {
    level = "MODERATE";
    badge_color = "amber";
    summary_message = "No urgent warning signs were identified by this tool. However, the duration, severity, or combination of symptoms suggests a medical consultation may be helpful if they persist.";
    guidance = "Consider speaking with a healthcare professional if symptoms persist beyond a few days or worsen. Seek prompt care if severe or concerning symptoms develop.";
  } else {
    level = "LOW";
    badge_color = "green";
    summary_message = "No urgent warning signs were identified by this tool.";
    guidance = "This does not rule out a medical problem. Seek professional advice if you are concerned or your symptoms worsen. Rest and monitor how you feel.";
  }

  return {
    level,
    badge_color,
    has_urgent_warning: isUrgent,
    triggered_warnings: triggered,
    summary_message,
    guidance,
    disclaimer: "This does not rule out a medical problem. Seek professional advice if you are concerned or your symptoms worsen."
  };
}
