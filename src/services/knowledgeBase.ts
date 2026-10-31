/**
 * Medical Knowledge Base for Symptom Reasoning System.
 * Replicates the structured CSV/SQLite datasets:
 * - 26 symptoms across 8 anatomical/system categories
 * - 8 evidence-grounded condition patterns
 * - Weighted symptom-condition associations
 */

export interface Symptom {
  symptom_id: string;
  symptom_name: string;
  category: string;
  synonyms: string[];
  description: string;
}

export interface ConditionPattern {
  condition_id: string;
  pattern_name: string;
  description: string;
  general_guidance: string;
  symptoms: {
    symptom_id: string;
    weight: number;
    symptom_name: string;
    category: string;
  }[];
}

export interface SymptomWeight {
  condition_id: string;
  symptom_id: string;
  weight: number;
}

export const SYMPTOMS_DATA: Symptom[] = [
  {
    symptom_id: "SYM01",
    symptom_name: "Fever",
    category: "General",
    synonyms: ["high temperature", "temp", "febrile", "pyrexia", "hot body", "running temperature", "burning up"],
    description: "Elevated body temperature above normal range (typically > 38.0°C or 100.4°F)."
  },
  {
    symptom_id: "SYM02",
    symptom_name: "Headache",
    category: "Neurological",
    synonyms: ["head pain", "head hurting", "throbbing head", "migraine", "head pounding", "cephalea"],
    description: "Pain or discomfort situated in the head, scalp, or neck area."
  },
  {
    symptom_id: "SYM03",
    symptom_name: "Cough",
    category: "Respiratory",
    synonyms: ["coughing", "dry cough", "hacking", "productive cough", "phlegm cough", "barking cough"],
    description: "Sudden expulsion of air from lungs to clear irritants or secretions."
  },
  {
    symptom_id: "SYM04",
    symptom_name: "Sore throat",
    category: "Respiratory",
    synonyms: ["throat pain", "scratchy throat", "raw throat", "hurts to swallow", "pharyngitis"],
    description: "Pain, scratchiness, or irritation of the throat that often worsens when swallowing."
  },
  {
    symptom_id: "SYM05",
    symptom_name: "Fatigue",
    category: "General",
    synonyms: ["tired", "exhaustion", "feeling drained", "worn out", "lethargy", "extreme tiredness", "sluggish"],
    description: "Subjective feeling of pervasive tiredness or lack of physical and mental energy."
  },
  {
    symptom_id: "SYM06",
    symptom_name: "Body pain",
    category: "Musculoskeletal",
    synonyms: ["body ache", "aching all over", "generalized pain", "sore body", "whole body hurts"],
    description: "Generalized muscular or systemic discomfort and tenderness across multiple areas."
  },
  {
    symptom_id: "SYM07",
    symptom_name: "Nausea",
    category: "Gastrointestinal",
    synonyms: ["queasy", "sick to my stomach", "feel sick", "upset stomach", "uneasy stomach"],
    description: "Unpleasant sensation of unease and discomfort in the upper stomach with an urge to vomit."
  },
  {
    symptom_id: "SYM08",
    symptom_name: "Vomiting",
    category: "Gastrointestinal",
    synonyms: ["throwing up", "puking", "emesis", "heaving", "threw up", "vomit"],
    description: "Involuntary, forceful oral expulsion of contents of the stomach."
  },
  {
    symptom_id: "SYM09",
    symptom_name: "Diarrhea",
    category: "Gastrointestinal",
    synonyms: ["loose stools", "watery stool", "frequent bowel movements", "runny tummy", "stomach upset"],
    description: "Passing looser or more frequent stools than normal."
  },
  {
    symptom_id: "SYM10",
    symptom_name: "Abdominal pain",
    category: "Gastrointestinal",
    synonyms: ["stomach ache", "belly pain", "cramps", "gut pain", "tummy ache", "abdominal cramps"],
    description: "Discomfort or pain localized within the peritoneal or abdominal region."
  },
  {
    symptom_id: "SYM11",
    symptom_name: "Dizziness",
    category: "Neurological",
    synonyms: ["lightheaded", "unsteady", "woozy", "vertigo", "off balance", "spinning"],
    description: "Sensory alteration of spatial orientation, feeling lightheaded or unsteady."
  },
  {
    symptom_id: "SYM12",
    symptom_name: "Rash",
    category: "Dermatological",
    synonyms: ["skin breakout", "hives", "skin redness", "itchy bumps", "dermatitis", "eruption"],
    description: "Noticeable change in texture or color of the skin, often itchy or erythematous."
  },
  {
    symptom_id: "SYM13",
    symptom_name: "Runny nose",
    category: "Respiratory",
    synonyms: ["rhinorrhea", "nasal discharge", "sniffling", "dripping nose", "clear mucus"],
    description: "Excess liquid or mucus discharging from the nasal passages."
  },
  {
    symptom_id: "SYM14",
    symptom_name: "Nasal congestion",
    category: "Respiratory",
    synonyms: ["stuffy nose", "blocked nose", "plugged nose", "sinus blockage", "stuffed up"],
    description: "Blockage of nasal passages usually caused by swollen mucous membranes."
  },
  {
    symptom_id: "SYM15",
    symptom_name: "Chills",
    category: "General",
    synonyms: ["shivering", "rigors", "cold sweats", "shivers", "feeling cold", "teeth chattering"],
    description: "Sensation of feeling cold accompanied by involuntary shivering or tremors."
  },
  {
    symptom_id: "SYM16",
    symptom_name: "Muscle pain",
    category: "Musculoskeletal",
    synonyms: ["myalgia", "muscle soreness", "aching muscles", "stiff muscles", "sore calves"],
    description: "Aching, tenderness, or soreness localized within muscles or soft tissues."
  },
  {
    symptom_id: "SYM17",
    symptom_name: "Joint pain",
    category: "Musculoskeletal",
    synonyms: ["arthralgia", "stiff joints", "joint ache", "swollen joints", "knee pain", "knuckle ache"],
    description: "Discomfort, tenderness, or inflammation in one or more joints."
  },
  {
    symptom_id: "SYM18",
    symptom_name: "Loss of appetite",
    category: "Gastrointestinal",
    synonyms: ["anorexia", "not hungry", "poor appetite", "no desire to eat", "lost appetite"],
    description: "Reduced desire to eat food or feeling satiated abnormally quickly."
  },
  {
    symptom_id: "SYM19",
    symptom_name: "Shortness of breath",
    category: "Respiratory",
    synonyms: ["breathlessness", "dyspnea", "hard to breathe", "winded", "struggling to breathe"],
    description: "Subjective experience of breathing discomfort or insufficient air intake."
  },
  {
    symptom_id: "SYM20",
    symptom_name: "Chest pain",
    category: "Cardiovascular",
    synonyms: ["chest tightness", "chest pressure", "chest discomfort", "tight chest", "stabbing chest"],
    description: "Pain, pressure, or tightness felt anywhere within the thoracic cavity."
  },
  {
    symptom_id: "SYM21",
    symptom_name: "Weakness",
    category: "General",
    synonyms: ["asthenia", "feeble", "physically drained", "no strength", "loss of strength"],
    description: "Lack of physical strength and reduced muscle power or stamina."
  },
  {
    symptom_id: "SYM22",
    symptom_name: "Loss of consciousness",
    category: "Urgent Red Flag",
    synonyms: ["passed out", "fainting", "syncope", "blacked out", "unresponsive"],
    description: "Sudden, brief loss of awareness and responsiveness."
  },
  {
    symptom_id: "SYM23",
    symptom_name: "Seizure",
    category: "Urgent Red Flag",
    synonyms: ["convulsions", "fits", "shaking fit", "epileptic fit"],
    description: "Sudden, uncontrolled electrical disturbance in the brain causing jerking movements."
  },
  {
    symptom_id: "SYM24",
    symptom_name: "Severe confusion",
    category: "Urgent Red Flag",
    synonyms: ["altered mental status", "delirium", "disoriented", "hallucinating", "not making sense"],
    description: "Acute disorientation regarding time, place, or identity with impaired cognition."
  },
  {
    symptom_id: "SYM25",
    symptom_name: "Severe bleeding",
    category: "Urgent Red Flag",
    synonyms: ["hemorrhage", "uncontrolled bleeding", "gushing blood", "heavy bleeding"],
    description: "Rapid, non-stopping blood loss from injury or internal orifice."
  },
  {
    symptom_id: "SYM26",
    symptom_name: "Blue or grey lips or face",
    category: "Urgent Red Flag",
    synonyms: ["cyanosis", "turning blue", "blue lips", "grey face", "ashen color"],
    description: "Cyanotic discoloration indicating severe hypoxemia or circulatory compromise."
  }
];

export const RAW_WEIGHTS: SymptomWeight[] = [
  // CP01: Influenza-like illness
  { condition_id: "CP01", symptom_id: "SYM01", weight: 0.90 },
  { condition_id: "CP01", symptom_id: "SYM03", weight: 0.80 },
  { condition_id: "CP01", symptom_id: "SYM05", weight: 0.75 },
  { condition_id: "CP01", symptom_id: "SYM06", weight: 0.75 },
  { condition_id: "CP01", symptom_id: "SYM15", weight: 0.70 },
  { condition_id: "CP01", symptom_id: "SYM02", weight: 0.65 },
  { condition_id: "CP01", symptom_id: "SYM16", weight: 0.70 },
  { condition_id: "CP01", symptom_id: "SYM04", weight: 0.60 },
  { condition_id: "CP01", symptom_id: "SYM21", weight: 0.60 },
  { condition_id: "CP01", symptom_id: "SYM18", weight: 0.50 },

  // CP02: Acute upper respiratory tract presentation
  { condition_id: "CP02", symptom_id: "SYM13", weight: 0.90 },
  { condition_id: "CP02", symptom_id: "SYM14", weight: 0.90 },
  { condition_id: "CP02", symptom_id: "SYM04", weight: 0.85 },
  { condition_id: "CP02", symptom_id: "SYM03", weight: 0.75 },
  { condition_id: "CP02", symptom_id: "SYM02", weight: 0.55 },
  { condition_id: "CP02", symptom_id: "SYM05", weight: 0.50 },
  { condition_id: "CP02", symptom_id: "SYM01", weight: 0.40 },

  // CP03: Acute gastroenteritis pattern
  { condition_id: "CP03", symptom_id: "SYM08", weight: 0.90 },
  { condition_id: "CP03", symptom_id: "SYM09", weight: 0.90 },
  { condition_id: "CP03", symptom_id: "SYM10", weight: 0.85 },
  { condition_id: "CP03", symptom_id: "SYM07", weight: 0.85 },
  { condition_id: "CP03", symptom_id: "SYM18", weight: 0.65 },
  { condition_id: "CP03", symptom_id: "SYM21", weight: 0.55 },
  { condition_id: "CP03", symptom_id: "SYM01", weight: 0.50 },
  { condition_id: "CP03", symptom_id: "SYM11", weight: 0.45 },

  // CP04: Primary tension or headache presentation
  { condition_id: "CP04", symptom_id: "SYM02", weight: 0.95 },
  { condition_id: "CP04", symptom_id: "SYM05", weight: 0.60 },
  { condition_id: "CP04", symptom_id: "SYM11", weight: 0.55 },
  { condition_id: "CP04", symptom_id: "SYM07", weight: 0.50 },
  { condition_id: "CP04", symptom_id: "SYM16", weight: 0.45 },

  // CP05: Allergic rhinitis or seasonal reactivity pattern
  { condition_id: "CP05", symptom_id: "SYM13", weight: 0.90 },
  { condition_id: "CP05", symptom_id: "SYM14", weight: 0.85 },
  { condition_id: "CP05", symptom_id: "SYM12", weight: 0.60 },
  { condition_id: "CP05", symptom_id: "SYM04", weight: 0.50 },
  { condition_id: "CP05", symptom_id: "SYM05", weight: 0.40 },

  // CP06: Musculoskeletal strain or viral myalgia pattern
  { condition_id: "CP06", symptom_id: "SYM16", weight: 0.90 },
  { condition_id: "CP06", symptom_id: "SYM06", weight: 0.85 },
  { condition_id: "CP06", symptom_id: "SYM17", weight: 0.80 },
  { condition_id: "CP06", symptom_id: "SYM21", weight: 0.65 },
  { condition_id: "CP06", symptom_id: "SYM05", weight: 0.60 },

  // CP07: Acute bronchitis-like presentation
  { condition_id: "CP07", symptom_id: "SYM03", weight: 0.90 },
  { condition_id: "CP07", symptom_id: "SYM20", weight: 0.70 },
  { condition_id: "CP07", symptom_id: "SYM05", weight: 0.65 },
  { condition_id: "CP07", symptom_id: "SYM04", weight: 0.60 },
  { condition_id: "CP07", symptom_id: "SYM19", weight: 0.55 },
  { condition_id: "CP07", symptom_id: "SYM01", weight: 0.50 },

  // CP08: Acute allergic cutaneous presentation
  { condition_id: "CP08", symptom_id: "SYM12", weight: 0.95 },
  { condition_id: "CP08", symptom_id: "SYM05", weight: 0.40 },
  { condition_id: "CP08", symptom_id: "SYM01", weight: 0.35 }
];

export const CONDITION_PATTERNS_BASE = [
  {
    condition_id: "CP01",
    pattern_name: "Influenza-like illness",
    description: "A characteristic systemic viral pattern featuring acute fever, severe fatigue, widespread myalgia/body ache, cough, and chills.",
    general_guidance: "Ensure adequate bed rest, prioritize oral hydration with fluids and electrolytes, monitor body temperature, and arrange medical evaluation if fever persists beyond 3 days or respiratory difficulty develops."
  },
  {
    condition_id: "CP02",
    pattern_name: "Acute upper respiratory tract presentation",
    description: "A localized upper airway presentation predominantly featuring rhinitis, nasal congestion, sore throat, mild cough, and sneezing (common cold presentation).",
    general_guidance: "Stay well-hydrated with warm fluids, utilize saline nasal rinses or humidified air to ease airway congestion, get plenty of rest, and seek healthcare advice if symptoms do not improve after 7-10 days."
  },
  {
    condition_id: "CP03",
    pattern_name: "Acute gastroenteritis pattern",
    description: "A gastrointestinal symptom constellation marked by nausea, vomiting, watery diarrhea, abdominal cramps, and decreased appetite.",
    general_guidance: "Prioritize gradual oral rehydration solutions (ORS) in small frequent sips to prevent dehydration, avoid fatty, dairy, or spicy foods, and consult a doctor if unable to keep fluids down or if signs of dehydration emerge."
  },
  {
    condition_id: "CP04",
    pattern_name: "Primary tension or headache presentation",
    description: "A neurological discomfort pattern characterized by aching or throbbing cephalic pain, associated mild fatigue, sensitivity, or lightheadedness without focal deficits.",
    general_guidance: "Rest in a quiet, dimly lit, well-ventilated room, stay hydrated, apply cold or warm compresses across the forehead or neck, and seek medical attention if headache is sudden and explosive or accompanied by neck stiffness."
  },
  {
    condition_id: "CP05",
    pattern_name: "Allergic rhinitis or seasonal reactivity pattern",
    description: "An immunologic upper airway and mucous membrane pattern marked by sneezing, clear runny nose, nasal congestion, itching, and occasional rash or ocular irritation.",
    general_guidance: "Identify and minimize exposure to potential environmental allergens (pollen, dust mites, pet dander), consider air purifiers, and discuss safe antihistaminic management with a qualified pharmacist or primary doctor."
  },
  {
    condition_id: "CP06",
    pattern_name: "Musculoskeletal strain or viral myalgia pattern",
    description: "A musculoskeletal pattern dominated by localized or generalized muscle soreness, stiffness, physical weakness, and joint discomfort without acute joint deformity.",
    general_guidance: "Allow affected muscle groups to rest, avoid strenuous lifting, apply alternating warm or cool packs, practice gentle stretching when tolerated, and seek clinical review if joint swelling or immobility occurs."
  },
  {
    condition_id: "CP07",
    pattern_name: "Acute bronchitis-like presentation",
    description: "A lower bronchial airway irritation pattern characterized by persistent cough, chest discomfort on coughing, fatigue, and mild systemic malaise.",
    general_guidance: "Maintain good hydration to loosen mucus, use a room humidifier, avoid tobacco smoke or respiratory irritants, and seek clinical evaluation if phlegm is blood-tinged or shortness of breath occurs."
  },
  {
    condition_id: "CP08",
    pattern_name: "Acute allergic cutaneous presentation",
    description: "A dermatological reactivity pattern featuring sudden localized or generalized skin rash, pruritus (itching), hives, or superficial erythema.",
    general_guidance: "Avoid scratching to protect the skin barrier, apply cool compresses or gentle calamine lotion, discontinue newly introduced topical agents, and seek prompt care if swelling of the lips, tongue, or airway develops."
  }
];

export const CONDITION_PATTERNS: ConditionPattern[] = CONDITION_PATTERNS_BASE.map((base) => {
  const symLinks = RAW_WEIGHTS.filter((w) => w.condition_id === base.condition_id);
  const enrichedSymptoms = symLinks
    .map((link) => {
      const sym = SYMPTOMS_DATA.find((s) => s.symptom_id === link.symptom_id);
      return {
        symptom_id: link.symptom_id,
        weight: link.weight,
        symptom_name: sym?.symptom_name || "Unknown",
        category: sym?.category || "General"
      };
    })
    .sort((a, b) => b.weight - a.weight);

  return {
    ...base,
    symptoms: enrichedSymptoms
  };
});
