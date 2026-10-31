/**
 * Natural Language Processing (NLP) Symptom Extractor (TypeScript).
 * Mirrors Python ai/symptom_extractor.py:
 * - Clause splitting & negation detection
 * - N-gram phrase matching and synonym lookup
 * - Normalizes vernacular phrases to canonical symptom entities
 */

import { SYMPTOMS_DATA, Symptom } from "./knowledgeBase";

const CONTRACTIONS: Record<string, string> = {
  "i'm": "i am",
  "i've": "i have",
  "don't": "do not",
  "didn't": "did not",
  "can't": "cannot",
  "haven't": "have not",
  "isn't": "is not",
  "aren't": "are not",
  "it's": "it is",
  "there's": "there is",
  "wasn't": "was not",
  "won't": "will not"
};

const NEGATION_CUES = [
  "no", "not", "without", "deny", "denies", "denied",
  "never", "free of", "don't have", "do not have", "neither", "nor"
];

const EXTRA_VERNACULAR: Record<string, string> = {
  "head hurts": "headache",
  "head hurting": "headache",
  "bad headache": "headache",
  "head pounding": "headache",
  "throwing up": "vomiting",
  "threw up": "vomiting",
  "feel like throwing up": "nausea",
  "feel like vomiting": "nausea",
  "feeling sick": "nausea",
  "sick to my stomach": "nausea",
  "upset stomach": "nausea",
  "tummy ache": "abdominal pain",
  "stomach ache": "abdominal pain",
  "belly hurts": "abdominal pain",
  "body hurts": "body pain",
  "body aching": "body pain",
  "aching all over": "body pain",
  "hurts all over": "body pain",
  "tired": "fatigue",
  "so tired": "fatigue",
  "very tired": "fatigue",
  "exhausted": "fatigue",
  "no energy": "fatigue",
  "drained": "fatigue",
  "runny tummy": "diarrhea",
  "loose motion": "diarrhea",
  "loose motions": "diarrhea",
  "watery stool": "diarrhea",
  "stuffy nose": "nasal congestion",
  "blocked nose": "nasal congestion",
  "hard to breathe": "shortness of breath",
  "can't breathe": "shortness of breath",
  "struggling to breathe": "shortness of breath",
  "tight chest": "chest pain",
  "chest tightness": "chest pain",
  "passed out": "loss of consciousness",
  "blacked out": "loss of consciousness",
  "fainted": "loss of consciousness",
  "fits": "seizure",
  "shaking fits": "seizure",
  "turning blue": "blue or grey lips or face",
  "blue lips": "blue or grey lips or face",
  "uncontrolled bleeding": "severe bleeding",
  "heavy bleeding": "severe bleeding"
};

export interface ExtractedSymptom {
  symptom_id: string;
  symptom_name: string;
  category: string;
  matched_phrase: string;
  description: string;
}

export interface ExtractionResult {
  detected_symptoms: ExtractedSymptom[];
  raw_matched_phrases: string[];
  negated_phrases: string[];
  cleaned_text: string;
}

export function cleanText(text: string): string {
  if (!text) return "";
  let clean = text.toLowerCase().trim();
  for (const [contr, expanded] of Object.entries(CONTRACTIONS)) {
    clean = clean.replaceAll(contr, expanded);
  }
  clean = clean.replace(/[^\w\s\.,;!?\-]/g, " ");
  clean = clean.replace(/\s+/g, " ");
  return clean;
}

function splitIntoClauses(text: string): string[] {
  const parts = text.split(/[\.,;!?\n]|(\band\b)|(\bbut\b)|(\balso\b)/gi);
  return parts
    .filter((p) => p && p.trim() && !["and", "but", "also"].includes(p.trim().toLowerCase()))
    .map((p) => p.trim());
}

function isNegated(clause: string, matchPhrase: string): boolean {
  const idx = clause.indexOf(matchPhrase);
  if (idx === -1) return false;
  const preceding = clause.slice(0, idx).trim();
  const tokens = preceding.split(/\s+/);
  const lastTokens = tokens.slice(-3).join(" ");
  return NEGATION_CUES.some((cue) => lastTokens.includes(cue));
}

// Build phrase lookup table
const PHRASE_LOOKUP = new Map<string, Symptom>();

SYMPTOMS_DATA.forEach((sym) => {
  PHRASE_LOOKUP.set(sym.symptom_name.toLowerCase().trim(), sym);
  sym.synonyms.forEach((syn) => {
    PHRASE_LOOKUP.set(syn.toLowerCase().trim(), sym);
  });
});

for (const [vernacular, targetName] of Object.entries(EXTRA_VERNACULAR)) {
  const target = SYMPTOMS_DATA.find((s) => s.symptom_name.toLowerCase() === targetName);
  if (target) {
    PHRASE_LOOKUP.set(vernacular.toLowerCase().trim(), target);
  }
}

const SORTED_PHRASES = Array.from(PHRASE_LOOKUP.keys()).sort((a, b) => b.length - a.length);

export function extractFromText(rawText: string): ExtractionResult {
  const cleaned = cleanText(rawText);
  if (!cleaned) {
    return {
      detected_symptoms: [],
      raw_matched_phrases: [],
      negated_phrases: [],
      cleaned_text: ""
    };
  }

  const clauses = splitIntoClauses(cleaned);
  const matchedIds = new Set<string>();
  const detectedList: ExtractedSymptom[] = [];
  const rawMatchedPhrases: string[] = [];
  const negatedPhrases: string[] = [];

  for (const clause of clauses) {
    for (const phrase of SORTED_PHRASES) {
      // Word boundary regex
      const regex = new RegExp(`(?:\\b|^)${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\b|$)`, "i");
      if (regex.test(clause)) {
        const sym = PHRASE_LOOKUP.get(phrase)!;
        if (isNegated(clause, phrase)) {
          negatedPhrases.push(`${phrase} (${sym.symptom_name})`);
        } else {
          if (!matchedIds.has(sym.symptom_id)) {
            matchedIds.add(sym.symptom_id);
            detectedList.push({
              symptom_id: sym.symptom_id,
              symptom_name: sym.symptom_name,
              category: sym.category,
              matched_phrase: phrase,
              description: sym.description
            });
            rawMatchedPhrases.push(phrase);
          }
        }
      }
    }
  }

  return {
    detected_symptoms: detectedList,
    raw_matched_phrases: rawMatchedPhrases,
    negated_phrases: negatedPhrases,
    cleaned_text: cleaned
  };
}

export function combineWithManualSelection(
  nlpDetected: ExtractedSymptom[],
  manualIds: string[]
): ExtractedSymptom[] {
  const map = new Map<string, ExtractedSymptom>();
  for (const item of nlpDetected) {
    map.set(item.symptom_id, item);
  }

  for (const id of manualIds) {
    if (!map.has(id)) {
      const sym = SYMPTOMS_DATA.find((s) => s.symptom_id === id);
      if (sym) {
        map.set(id, {
          symptom_id: sym.symptom_id,
          symptom_name: sym.symptom_name,
          category: sym.category,
          matched_phrase: "manual_selection",
          description: sym.description
        });
      }
    }
  }

  return Array.from(map.values());
}
