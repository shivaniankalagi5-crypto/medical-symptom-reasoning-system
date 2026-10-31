"""
Risk Assessment Engine.

Evaluates predefined clinical red-flag warning signs and categorizes
symptom severity into informational prototype guidance tiers.

CRITICAL SAFETY PROTOCOL:
This module does NOT diagnose emergency conditions or formulate clinical prognoses.
It inspects inputs for pre-established high-risk warning signs (e.g. chest pain,
cyanosis, syncope, acute respiratory distress) and prompts immediate emergency evaluation.
"""

from typing import List, Dict, Any

# Predefined urgent clinical warning signs (Red Flags)
URGENT_WARNING_SYMPTOMS = {
    "SYM22": {
        "name": "Loss of consciousness",
        "reason": "Sudden loss of awareness (syncope) may indicate critical cardiovascular or neurological compromise."
    },
    "SYM23": {
        "name": "Seizure",
        "reason": "Sudden unprovoked epileptic or convulsive episodes require urgent acute medical workup."
    },
    "SYM24": {
        "name": "Severe confusion",
        "reason": "Acute delirium or disorientation can signal intracranial, metabolic, or severe septic disturbance."
    },
    "SYM25": {
        "name": "Severe bleeding",
        "reason": "Uncontrolled active hemorrhage presents an immediate risk of hypovolemic compromise."
    },
    "SYM26": {
        "name": "Blue or grey lips or face",
        "reason": "Cyanosis indicates severe hypoxemia or acute respiratory/circulatory insufficiency."
    },
    "SYM19": {
        "name": "Shortness of breath",
        "reason": "Reported breathing difficulty or acute dyspnea may indicate critical lower airway or cardiorespiratory distress."
    },
    "SYM20": {
        "name": "Chest pain",
        "reason": "Thoracic discomfort or acute chest pressure requires urgent electrocardiographic and clinical exclusion of acute coronary/thoracic syndromes."
    }
}

# Red-flag keywords in free text
URGENT_TEXT_KEYWORDS = [
    "chest pain", "tight chest", "chest pressure", "heart attack",
    "can't breathe", "struggling to breathe", "cannot breathe", "gasping for air",
    "passed out", "blacked out", "fainted", "unconscious",
    "seizure", "convulsions", "fits",
    "delirium", "hallucinating", "severe confusion",
    "heavy bleeding", "gushing blood", "uncontrolled bleeding",
    "blue lips", "grey lips", "blue face", "cyanosis"
]


class RiskAssessmentEngine:
    """Evaluates red-flag warning signs and provides informational prototype risk guidance."""

    @staticmethod
    def evaluate(
        detected_symptoms: List[Dict[str, Any]],
        raw_text: str = "",
        duration: str = "",
        severity: str = ""
    ) -> Dict[str, Any]:
        """
        Assesses warning signs from detected symptoms, natural text keywords, duration, and severity.
        """
        detected_ids = {s["symptom_id"] for s in detected_symptoms}
        triggered_warnings = []

        # 1. Check structured symptoms
        for sym_id, warn_info in URGENT_WARNING_SYMPTOMS.items():
            if sym_id in detected_ids:
                triggered_warnings.append({
                    "symptom_id": sym_id,
                    "symptom_name": warn_info["name"],
                    "clinical_concern": warn_info["reason"]
                })

        # 2. Check raw text keywords if not already captured
        lower_text = raw_text.lower() if raw_text else ""
        for kw in URGENT_TEXT_KEYWORDS:
            if kw in lower_text:
                if not any(kw in w["symptom_name"].lower() or kw in w["clinical_concern"].lower() for w in triggered_warnings):
                    triggered_warnings.append({
                        "symptom_id": "KEYWORD_FLAG",
                        "symptom_name": f"Warning phrase detected: '{kw}'",
                        "clinical_concern": "Free-text description contains language corresponding to an acute warning sign."
                    })

        # Determine Guidance Category
        if triggered_warnings or severity == "Severe":
            level = "URGENT MEDICAL ATTENTION"
            badge_color = "red"
            summary_message = (
                "Some reported symptoms or descriptors may indicate potential urgent warning signs. "
                "Please seek immediate medical or emergency evaluation at an emergency room or call local emergency services."
            )
            guidance = (
                "Do not wait for symptoms to resolve on their own. "
                "Urgent evaluation by a qualified medical professional is strongly advised."
            )
        elif severity == "Moderate" or duration in ["3–7 days", "More than 1 week"] or len(detected_symptoms) >= 4:
            level = "MODERATE"
            badge_color = "amber"
            summary_message = (
                "Symptoms are present without detected acute emergency warning signs, but their duration, severity, "
                "or combination warrants structured clinical evaluation if they persist or escalate."
            )
            guidance = (
                "Consider consulting a primary healthcare provider or local clinic if symptoms do not improve within 48 hours, "
                "or immediately if any new severe warning signs develop."
            )
        else:
            level = "LOW"
            badge_color = "green"
            summary_message = (
                "Reported symptoms currently appear mild without detected urgent warning signs. "
                "This educational assessment reflects a low-urgency informational pattern."
            )
            guidance = (
                "Prioritize supportive self-care (hydration, rest) and continue monitoring. "
                "Seek medical advice if symptoms persist beyond a few days or worsen."
            )

        return {
            "level": level,
            "badge_color": badge_color,
            "has_urgent_warning": (level == "URGENT MEDICAL ATTENTION"),
            "triggered_warnings": triggered_warnings,
            "summary_message": summary_message,
            "guidance": guidance,
            "disclaimer": (
                "Educational notice: This is a prototype guidance categorization and NOT a clinical triage "
                "score, validated diagnostic assessment, or substitute for emergency medical care."
            )
        }
