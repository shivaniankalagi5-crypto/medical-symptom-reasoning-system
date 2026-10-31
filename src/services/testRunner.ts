/**
 * Automated Viva Test Runner (TypeScript).
 * Implements the 8 required test cases for college evaluation:
 * Test 1: Fever + cough + fatigue
 * Test 2: Headache + nausea
 * Test 3: Vomiting + diarrhea + abdominal pain
 * Test 4: NLP "I have fever, headache and body pain."
 * Test 5: NLP "My head hurts and I feel like vomiting."
 * Test 6: Input containing a predefined warning sign
 * Test 7: Empty input
 * Test 8: Unknown symptom
 */

import { SYMPTOMS_DATA } from "./knowledgeBase";
import { extractFromText } from "./symptomExtractor";
import { reasonSymptoms, ReasoningOutput } from "./reasoningEngine";

export interface TestCaseResult {
  id: number;
  title: string;
  category: "Structured Symptoms" | "Natural Language (NLP)" | "Safety Red Flag" | "Edge Case";
  inputDesc: string;
  expected: string;
  actual: string;
  passed: boolean;
  scoreStr?: string;
  topPattern?: string;
  riskLevel?: string;
  details: ReasoningOutput;
}

export function runAllTestCases(): {
  total: number;
  passedCount: number;
  failedCount: number;
  results: TestCaseResult[];
} {
  const cases: TestCaseResult[] = [];

  // Test 1: Fever + Cough + Fatigue
  {
    const syms = [
      { symptom_id: "SYM01", symptom_name: "Fever", category: "General", matched_phrase: "test", description: "" },
      { symptom_id: "SYM03", symptom_name: "Cough", category: "Respiratory", matched_phrase: "test", description: "" },
      { symptom_id: "SYM05", symptom_name: "Fatigue", category: "General", matched_phrase: "test", description: "" }
    ];
    const out = reasonSymptoms(syms, "fever cough fatigue", "Adult", "1–2 days", "Moderate");
    const top = out.top_patterns[0];
    const passed = Boolean(top && ["CP01", "CP02", "CP07"].includes(top.condition_id) && top.match_score > 35);
    cases.push({
      id: 1,
      title: "Test 1: Fever + Cough + Fatigue",
      category: "Structured Symptoms",
      inputDesc: "Checklist input of 3 classic systemic respiratory symptoms.",
      expected: "Matches Influenza-like illness or Bronchitis pattern (> 35% match score)",
      actual: `Top match: ${top?.pattern_name || "None"} (${top?.match_score_str || "0%"})`,
      passed,
      scoreStr: top?.match_score_str,
      topPattern: top?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 2: Headache + Nausea
  {
    const syms = [
      { symptom_id: "SYM02", symptom_name: "Headache", category: "Neurological", matched_phrase: "test", description: "" },
      { symptom_id: "SYM07", symptom_name: "Nausea", category: "Gastrointestinal", matched_phrase: "test", description: "" }
    ];
    const out = reasonSymptoms(syms, "headache and nausea", "Adult", "1–2 days", "Moderate");
    const top = out.top_patterns[0];
    const passed = Boolean(top && ["CP04", "CP03"].includes(top.condition_id));
    cases.push({
      id: 2,
      title: "Test 2: Headache + Nausea",
      category: "Structured Symptoms",
      inputDesc: "Checklist input of cephalic and gastrointestinal presentation.",
      expected: "Matches Primary tension/headache or Gastroenteritis pattern",
      actual: `Top match: ${top?.pattern_name || "None"} (${top?.match_score_str || "0%"})`,
      passed,
      scoreStr: top?.match_score_str,
      topPattern: top?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 3: Vomiting + Diarrhea + Abdominal pain
  {
    const syms = [
      { symptom_id: "SYM08", symptom_name: "Vomiting", category: "Gastrointestinal", matched_phrase: "test", description: "" },
      { symptom_id: "SYM09", symptom_name: "Diarrhea", category: "Gastrointestinal", matched_phrase: "test", description: "" },
      { symptom_id: "SYM10", symptom_name: "Abdominal pain", category: "Gastrointestinal", matched_phrase: "test", description: "" }
    ];
    const out = reasonSymptoms(syms, "vomiting diarrhea abdominal pain", "Adult", "1–2 days", "Moderate");
    const top = out.top_patterns[0];
    const passed = Boolean(top && top.condition_id === "CP03" && top.match_score > 45);
    cases.push({
      id: 3,
      title: "Test 3: Vomiting + Diarrhea + Abdominal Pain",
      category: "Structured Symptoms",
      inputDesc: "Checklist input of triad acute enteric symptoms.",
      expected: "Matches Acute Gastroenteritis pattern (> 45% match score)",
      actual: `Top match: ${top?.pattern_name || "None"} (${top?.match_score_str || "0%"})`,
      passed,
      scoreStr: top?.match_score_str,
      topPattern: top?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 4: NLP "I have fever, headache and body pain."
  {
    const text = "I have fever, headache and body pain.";
    const nlp = extractFromText(text);
    const names = nlp.detected_symptoms.map((s) => s.symptom_name);
    const out = reasonSymptoms(nlp.detected_symptoms, text, "Adult", "3–7 days", "Moderate");
    const top = out.top_patterns[0];
    const passed = names.includes("Fever") && names.includes("Headache") && names.includes("Body pain");
    cases.push({
      id: 4,
      title: "Test 4: NLP 'I have fever, headache and body pain.'",
      category: "Natural Language (NLP)",
      inputDesc: "Free-form narrative with multi-symptom sentence.",
      expected: "Extracts Fever, Headache, and Body pain entities correctly",
      actual: `Extracted: ${names.join(", ")}. Top match: ${top?.pattern_name || "None"}`,
      passed,
      scoreStr: top?.match_score_str,
      topPattern: top?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 5: NLP "My head hurts and I feel like vomiting."
  {
    const text = "My head hurts and I feel like vomiting.";
    const nlp = extractFromText(text);
    const names = nlp.detected_symptoms.map((s) => s.symptom_name);
    const out = reasonSymptoms(nlp.detected_symptoms, text, "Adult", "1–2 days", "Moderate");
    const top = out.top_patterns[0];
    const passed = names.includes("Headache") && (names.includes("Nausea") || names.includes("Vomiting"));
    cases.push({
      id: 5,
      title: "Test 5: NLP 'My head hurts and I feel like vomiting.'",
      category: "Natural Language (NLP)",
      inputDesc: "Colloquial vernacular expressions requiring synonym normalization.",
      expected: "Normalizes 'head hurts' -> Headache, 'feel like vomiting' -> Nausea",
      actual: `Normalized: ${names.join(", ")}. Top match: ${top?.pattern_name || "None"}`,
      passed,
      scoreStr: top?.match_score_str,
      topPattern: top?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 6: Input containing a predefined warning sign
  {
    const text = "I have severe chest pain and severe difficulty breathing.";
    const nlp = extractFromText(text);
    const out = reasonSymptoms(nlp.detected_symptoms, text, "Adult", "Less than 1 day", "Severe");
    const passed = out.risk_assessment.level === "URGENT MEDICAL ATTENTION" && out.risk_assessment.has_urgent_warning;
    cases.push({
      id: 6,
      title: "Test 6: Predefined Warning Sign (Chest pain & dyspnea)",
      category: "Safety Red Flag",
      inputDesc: "Severe emergency cardiovascular and respiratory complaint.",
      expected: "Triggers 'URGENT MEDICAL ATTENTION' alert with red-flag breakdown",
      actual: `Risk Level: ${out.risk_assessment.level}. Warning flags: ${out.risk_assessment.triggered_warnings.length}`,
      passed,
      scoreStr: "N/A (Emergency)",
      topPattern: out.top_patterns[0]?.pattern_name,
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 7: Empty input
  {
    const out = reasonSymptoms([], "", "Adult", "1–2 days", "Mild");
    const passed = out.status === "empty_input" && out.top_patterns.length === 0;
    cases.push({
      id: 7,
      title: "Test 7: Empty Input",
      category: "Edge Case",
      inputDesc: "Submission with zero symptoms selected and blank narrative.",
      expected: "Graceful validation error prompting user without crash",
      actual: `Status: '${out.status}'. Returned 0 pattern false matches.`,
      passed,
      scoreStr: "N/A",
      topPattern: "None",
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  // Test 8: Unknown symptom
  {
    const text = "I am feeling quantum flux and chromatic reverberations in my astral aura.";
    const nlp = extractFromText(text);
    const out = reasonSymptoms(nlp.detected_symptoms, text, "Adult", "1–2 days", "Mild");
    const passed = out.status === "no_symptoms_matched" && out.top_patterns.length === 0;
    cases.push({
      id: 8,
      title: "Test 8: Unknown Symptom / Non-Medical Input",
      category: "Edge Case",
      inputDesc: "Nonsense non-medical text with zero clinical entity overlap.",
      expected: "0 false positive symptom extractions and 0 pattern matches",
      actual: `Status: '${out.status}'. Extractions: ${nlp.detected_symptoms.length}.`,
      passed,
      scoreStr: "N/A",
      topPattern: "None",
      riskLevel: out.risk_assessment.level,
      details: out
    });
  }

  return {
    total: cases.length,
    passedCount: cases.filter((c) => c.passed).length,
    failedCount: cases.filter((c) => !c.passed).length,
    results: cases
  };
}
