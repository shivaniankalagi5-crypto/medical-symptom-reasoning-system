/**
 * AI Reasoning Engine (TypeScript).
 * Matches detected symptoms against knowledge-base condition patterns,
 * computes weighted coverage and TF-IDF similarity, and generates Explainable AI rationales.
 */

import { CONDITION_PATTERNS, ConditionPattern } from "./knowledgeBase";
import { ExtractedSymptom } from "./symptomExtractor";
import { calculateSimilarityToPatterns } from "./textSimilarity";
import { evaluateRisk, RiskResult } from "./riskAssessment";

export interface MatchedSymptomDetail {
  symptom_id: string;
  symptom_name: string;
  weight: number;
  contribution_percent: number;
}

export interface PatternMatchResult {
  condition_id: string;
  pattern_name: string;
  match_score: number;
  match_score_str: string;
  matched_symptoms: MatchedSymptomDetail[];
  missing_symptoms: string[];
  total_pattern_symptoms_count: number;
  matched_count: number;
  description: string;
  general_guidance: string;
  explanation: string;
  metrics: {
    kb_coverage_ratio: number;
    cosine_similarity: number;
    matched_weight_sum: number;
    total_weight_sum: number;
  };
}

export interface ReasoningOutput {
  status: "success" | "empty_input" | "no_symptoms_matched" | "warning_detected_only";
  message?: string;
  detected_symptoms: ExtractedSymptom[];
  detected_symptom_count: number;
  top_patterns: PatternMatchResult[];
  all_patterns_count: number;
  risk_assessment: RiskResult;
  metadata: {
    age_group: string;
    duration: string;
    severity: string;
    raw_narrative: string;
  };
  general_guidance: string;
  disclaimer: string;
}

export function reasonSymptoms(
  detectedSymptoms: ExtractedSymptom[],
  rawNarrative: string = "",
  ageGroup: string = "Adult",
  duration: string = "1–2 days",
  severity: string = "Moderate"
): ReasoningOutput {
  const riskEval = evaluateRisk(detectedSymptoms, rawNarrative, duration, severity);

  // 1. Edge Case: Empty or no detected symptoms
  if (detectedSymptoms.length === 0) {
    if (riskEval.has_urgent_warning) {
      return {
        status: "warning_detected_only",
        message: "Warning phrases were detected in your narrative, though no recognized routine symptom could be mapped.",
        detected_symptoms: [],
        detected_symptom_count: 0,
        top_patterns: [],
        all_patterns_count: CONDITION_PATTERNS.length,
        risk_assessment: riskEval,
        metadata: { age_group: ageGroup, duration, severity, raw_narrative: rawNarrative },
        general_guidance: "Please seek prompt medical evaluation for the acute warning signs described.",
        disclaimer: "Educational Disclaimer: This system is an informational prototype and does not provide medical diagnoses."
      };
    }

    return {
      status: rawNarrative.trim() ? "no_symptoms_matched" : "empty_input",
      message: rawNarrative.trim()
        ? "No recognized medical symptoms could be identified from your input. Please describe your symptoms with standard terms or select them from the checklist."
        : "No symptoms were provided. Please describe your symptoms or select them from the list.",
      detected_symptoms: [],
      detected_symptom_count: 0,
      top_patterns: [],
      all_patterns_count: CONDITION_PATTERNS.length,
      risk_assessment: riskEval,
      metadata: { age_group: ageGroup, duration, severity, raw_narrative: rawNarrative },
      general_guidance: "Please enter or select at least one recognizable symptom to begin the reasoning process.",
      disclaimer: "Educational Disclaimer: This system is an informational prototype and does not provide medical diagnoses."
    };
  }

  // 2. TF-IDF Cosine Similarities across all pattern profiles
  const similarityScores = calculateSimilarityToPatterns(
    rawNarrative || detectedSymptoms.map((s) => s.symptom_name).join(" "),
    CONDITION_PATTERNS
  );

  const detectedSymIds = new Set(detectedSymptoms.map((s) => s.symptom_id));
  const patternMatches: PatternMatchResult[] = [];

  // 3. Knowledge-Based Weighted Evaluation
  for (const pattern of CONDITION_PATTERNS) {
    const totalPatternWeight = pattern.symptoms.reduce((acc, s) => acc + s.weight, 0) || 1.0;
    let matchedWeight = 0;

    const matchedDetails: MatchedSymptomDetail[] = [];
    const missingSymptoms: string[] = [];

    for (const ps of pattern.symptoms) {
      if (detectedSymIds.has(ps.symptom_id)) {
        matchedWeight += ps.weight;
        matchedDetails.push({
          symptom_id: ps.symptom_id,
          symptom_name: ps.symptom_name,
          weight: ps.weight,
          contribution_percent: Number(((ps.weight / totalPatternWeight) * 100).toFixed(1))
        });
      } else {
        missingSymptoms.push(ps.symptom_name);
      }
    }

    const kbRatio = totalPatternWeight > 0 ? matchedWeight / totalPatternWeight : 0;
    const cosSim = similarityScores[pattern.condition_id] || 0;

    let combinedScore = 0;
    if (matchedDetails.length > 0) {
      const rawScore = 0.75 * kbRatio + 0.25 * cosSim;
      combinedScore = Number((Math.min(0.96, Math.max(0.10, rawScore)) * 100).toFixed(1));
    }

    // Natural User-Facing Explainability Rationale
    const matchedNames = matchedDetails.map((m) => m.symptom_name.toLowerCase());
    const missingTopNames = missingSymptoms.slice(0, 3);
    let explanation = "";

    if (matchedNames.length === 1) {
      explanation = `Your reported ${matchedNames[0]} is commonly associated with this symptom pattern.`;
    } else if (matchedNames.length === 2) {
      explanation = `Your reported ${matchedNames[0]} and ${matchedNames[1]} are commonly associated with this symptom pattern.`;
    } else if (matchedNames.length > 2) {
      const allExceptLast = matchedNames.slice(0, -1).join(", ");
      const last = matchedNames[matchedNames.length - 1];
      explanation = `Your reported ${allExceptLast} and ${last} are commonly associated with this symptom pattern.`;
    } else {
      explanation = "This symptom pattern did not directly match any of your reported symptoms.";
    }

    patternMatches.push({
      condition_id: pattern.condition_id,
      pattern_name: pattern.pattern_name,
      match_score: combinedScore,
      match_score_str: `${Math.round(combinedScore)}%`,
      matched_symptoms: matchedDetails,
      missing_symptoms: missingTopNames,
      total_pattern_symptoms_count: pattern.symptoms.length,
      matched_count: matchedDetails.length,
      description: pattern.description,
      general_guidance: pattern.general_guidance,
      explanation,
      metrics: {
        kb_coverage_ratio: Number(kbRatio.toFixed(3)),
        cosine_similarity: Number(cosSim.toFixed(3)),
        matched_weight_sum: Number(matchedWeight.toFixed(2)),
        total_weight_sum: Number(totalPatternWeight.toFixed(2))
      }
    });
  }

  // 4. Rank by match score descending
  patternMatches.sort((a, b) => b.match_score - a.match_score);
  const meaningful = patternMatches.filter((p) => p.matched_count > 0);
  const top3 = meaningful.length > 0 ? meaningful.slice(0, 3) : patternMatches.slice(0, 3);

  const topName = top3[0]?.pattern_name || "Unspecified Presentation";
  const generalGuidance = `Based on your reported symptoms, the most relevant pattern aligns with '${topName}'. Monitor how your symptoms change over time. Consider speaking with a healthcare professional if symptoms persist, worsen, or cause concern. Seek urgent medical care if severe or concerning symptoms develop.`;

  return {
    status: "success",
    detected_symptoms: detectedSymptoms,
    detected_symptom_count: detectedSymptoms.length,
    top_patterns: top3,
    all_patterns_count: CONDITION_PATTERNS.length,
    risk_assessment: riskEval,
    metadata: {
      age_group: ageGroup,
      duration,
      severity,
      raw_narrative: rawNarrative
    },
    general_guidance: generalGuidance,
    disclaimer: "Important: This tool provides general informational guidance based on the symptoms you enter. It does not provide a medical diagnosis and cannot replace evaluation by a qualified healthcare professional."
  };
}
