"""
AI Reasoning Engine.

Implements knowledge-based weighted symptom-pattern matching combined with
TF-IDF semantic cosine similarity to produce transparent, explainable matches.

Safety Requirements:
- Scores are strictly titled "Symptom Pattern Match Score".
- Never claims disease probabilities, clinical accuracy, or definitive diagnoses.
- Generates natural-language rationales detailing why each pattern was identified.
"""

import os
import sys
from typing import List, Dict, Any, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_condition_patterns
from ai.text_similarity import calculate_similarity_to_patterns
from ai.risk_assessment import RiskAssessmentEngine


class ReasoningEngine:
    """Knowledge-based symptom pattern matching and explainable AI engine."""

    def __init__(self):
        self.patterns: List[Dict[str, Any]] = []
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Loads condition patterns and their symptom weights from the database."""
        try:
            self.patterns = get_condition_patterns()
        except Exception:
            self.patterns = []

    def reason(
        self,
        detected_symptoms: List[Dict[str, Any]],
        raw_narrative: str = "",
        age_group: str = "Adult",
        duration: str = "1–2 days",
        severity: str = "Moderate"
    ) -> Dict[str, Any]:
        """
        Executes the reasoning cycle:
        1. Compares detected symptoms with each condition pattern in the knowledge base.
        2. Applies clinical symptom-pattern weights.
        3. Computes TF-IDF cosine similarity between narrative and pattern descriptions.
        4. Calculates normalized Symptom Pattern Match Scores.
        5. Performs predefined warning-sign risk evaluation.
        6. Generates full explainability traces for the top 3 patterns.
        """
        if not self.patterns:
            self.load_knowledge_base()

        detected_sym_ids = {s["symptom_id"] for s in detected_symptoms}
        detected_sym_names = [s["symptom_name"] for s in detected_symptoms]

        # Edge case: No symptoms detected either directly or extracted from narrative
        if not detected_symptoms:
            risk_eval = RiskAssessmentEngine.evaluate([], raw_narrative, duration, severity)
            # If warning keywords exist in raw text despite no standard symptom match
            if risk_eval["has_urgent_warning"]:
                return {
                    "status": "warning_detected_only",
                    "message": "Potential warning phrases were detected in your description, though no specific standard symptom pattern could be mapped.",
                    "detected_symptoms": [],
                    "top_patterns": [],
                    "risk_assessment": risk_eval,
                    "general_guidance": "Please seek prompt medical evaluation for the acute warning signs described."
                }
            return {
                "status": "no_symptoms_matched" if raw_narrative.strip() else "empty_input",
                "message": (
                    "No recognized medical symptoms could be identified from your input. "
                    "Please describe your symptoms using common terms or select symptoms directly from the checklist."
                    if raw_narrative.strip() else
                    "No symptoms were provided. Please describe your symptoms or select them from the list."
                ),
                "detected_symptoms": [],
                "top_patterns": [],
                "risk_assessment": risk_eval,
                "general_guidance": "Please enter or select at least one recognizable symptom to begin the reasoning process."
            }

        # 1. Compute NLP TF-IDF Cosine Similarities across all pattern profiles
        similarity_scores = calculate_similarity_to_patterns(
            raw_narrative or " ".join(detected_sym_names),
            self.patterns
        )

        pattern_matches = []

        # 2. Weighted Knowledge-Based Pattern Evaluation
        for pattern in self.patterns:
            cond_id = pattern["condition_id"]
            pattern_symptoms = pattern.get("symptoms", [])

            total_pattern_weight = sum(s["weight"] for s in pattern_symptoms) or 1.0
            matched_weight = 0.0

            matched_symptoms_details = []
            missing_symptoms_details = []

            for ps in pattern_symptoms:
                sym_id = ps["symptom_id"]
                w = ps["weight"]
                sym_name = ps["symptom_name"]

                if sym_id in detected_sym_ids:
                    matched_weight += w
                    matched_symptoms_details.append({
                        "symptom_id": sym_id,
                        "symptom_name": sym_name,
                        "weight": w,
                        "contribution_percent": round((w / total_pattern_weight) * 100, 1)
                    })
                else:
                    missing_symptoms_details.append({
                        "symptom_id": sym_id,
                        "symptom_name": sym_name,
                        "weight": w
                    })

            # Weighted Knowledge-Base Match Ratio
            kb_ratio = matched_weight / total_pattern_weight if total_pattern_weight > 0 else 0.0

            # Cosine similarity metric
            cos_sim = similarity_scores.get(cond_id, 0.0)

            # Penalty for missing core cardinal symptoms if matched symptoms count is 0
            if len(matched_symptoms_details) == 0:
                combined_score = 0.0
            else:
                # Hybrid blending formula:
                # 75% weighted knowledge-base coverage + 25% semantic cosine similarity
                raw_score = (0.75 * kb_ratio) + (0.25 * cos_sim)
                # Normalize and bound to reasonable percentage
                combined_score = round(min(0.96, max(0.10, raw_score)) * 100, 1)

            # Human-readable Explainability Rationale
            matched_names = [m["symptom_name"] for m in matched_symptoms_details]
            missing_top_names = [m["symptom_name"] for m in missing_symptoms_details[:3]]

            if matched_names:
                if len(matched_names) == 1:
                    matched_str = matched_names[0]
                elif len(matched_names) == 2:
                    matched_str = f"{matched_names[0]} and {matched_names[1]}"
                else:
                    matched_str = f"{', '.join(matched_names[:-1])}, and {matched_names[-1]}"

                explanation = (
                    f"The system identified this pattern because the reported presentation included "
                    f"{matched_str}, which are established key features in the knowledge-base profile "
                    f"for this condition pattern."
                )
            else:
                explanation = "This condition pattern did not directly match any of your reported symptoms."

            pattern_matches.append({
                "condition_id": cond_id,
                "pattern_name": pattern["pattern_name"],
                "match_score": combined_score,
                "match_score_str": f"{int(round(combined_score))}%",
                "matched_symptoms": matched_symptoms_details,
                "missing_symptoms": missing_top_names,
                "total_pattern_symptoms_count": len(pattern_symptoms),
                "matched_count": len(matched_symptoms_details),
                "description": pattern["description"],
                "general_guidance": pattern["general_guidance"],
                "explanation": explanation,
                "metrics": {
                    "kb_coverage_ratio": round(kb_ratio, 3),
                    "cosine_similarity": round(cos_sim, 3),
                    "matched_weight_sum": round(matched_weight, 2),
                    "total_weight_sum": round(total_pattern_weight, 2)
                }
            })

        # 3. Sort by match score descending
        ranked_patterns = sorted(pattern_matches, key=lambda x: x["match_score"], reverse=True)

        # Filter out patterns with zero matched symptoms if at least one pattern matched
        meaningful_patterns = [p for p in ranked_patterns if p["matched_count"] > 0]
        top_3 = meaningful_patterns[:3] if meaningful_patterns else ranked_patterns[:3]

        # 4. Perform Risk Assessment
        risk_result = RiskAssessmentEngine.evaluate(
            detected_symptoms=detected_symptoms,
            raw_text=raw_narrative,
            duration=duration,
            severity=severity
        )

        # 5. Overarching general guidance
        top_pattern_name = top_3[0]["pattern_name"] if top_3 else "Unspecified Presentation"
        top_score = top_3[0]["match_score"] if top_3 else 0.0

        general_guidance = (
            f"Based on your reported symptoms, the highest pattern affinity aligns with a '{top_pattern_name}'. "
            "Maintain proper hydration, adequate rest, and monitor your symptoms closely. "
            "If your symptoms worsen, persist beyond expected durations, or cause distress, "
            "please arrange an in-person clinical consultation with a healthcare provider."
        )

        return {
            "status": "success",
            "detected_symptoms": detected_symptoms,
            "detected_symptom_count": len(detected_symptoms),
            "top_patterns": top_3,
            "all_patterns_count": len(self.patterns),
            "risk_assessment": risk_result,
            "metadata": {
                "age_group": age_group,
                "duration": duration,
                "severity": severity,
                "raw_narrative": raw_narrative
            },
            "general_guidance": general_guidance,
            "disclaimer": (
                "Educational Disclaimer: This system is an informational, educational prototype developed "
                "for artificial intelligence coursework. It does not provide medical diagnosis, clinical evaluation, "
                "or pharmacologic treatment advice. Always consult a qualified medical professional for health concerns."
            )
        }


# Global reasoning engine instance
engine = ReasoningEngine()
