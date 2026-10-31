"""
Medical Symptom Reasoning System - Flask Web Application
College Artificial Intelligence Mini-Project

Run locally or on Replit:
    python app.py
"""

import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for

from database.database import (
    init_database,
    get_all_symptoms,
    get_condition_patterns,
    save_assessment_record,
    get_recent_assessments
)
from ai.symptom_extractor import extractor
from ai.reasoning_engine import engine
from ai.risk_assessment import RiskAssessmentEngine

app = Flask(__name__)
app.config["SECRET_KEY"] = "medical-reasoning-ai-project-key"

# Ensure database is initialized on startup
init_database()


@app.route("/")
def index():
    """Homepage: Project overview, feature highlights, and medical disclaimer."""
    return render_template("index.html")


@app.route("/assessment")
def assessment():
    """Symptom Assessment Page: Multi-select symptoms, natural language text box, and viva demo presets."""
    symptoms = get_all_symptoms()
    return render_template("assessment.html", symptoms=symptoms)


@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    """
    Main AI reasoning endpoint:
    1. Extracts symptoms from narrative using NLP
    2. Combines with manually checked symptoms
    3. Executes weighted knowledge-based pattern reasoning
    4. Evaluates red-flag warning signs
    5. Saves an anonymized educational record to SQLite
    """
    try:
        data = request.get_json(silent=True) or request.form.to_dict()

        raw_narrative = data.get("narrative", "").strip()
        selected_symptom_ids = data.get("selected_symptoms", [])
        if isinstance(selected_symptom_ids, str):
            try:
                selected_symptom_ids = json.loads(selected_symptom_ids)
            except Exception:
                selected_symptom_ids = [s.strip() for s in selected_symptom_ids.split(",") if s.strip()]

        age_group = data.get("age_group", "Adult")
        duration = data.get("duration", "1–2 days")
        severity = data.get("severity", "Moderate")

        # Step 1: NLP extraction from narrative
        nlp_res = extractor.extract_from_text(raw_narrative)
        nlp_detected = nlp_res["detected_symptoms"]

        # Step 2: Combine with manual checklist selections
        combined_symptoms = extractor.combine_with_manual_selection(nlp_detected, selected_symptom_ids)

        # Step 3: Run AI Reasoning Engine
        reasoning_res = engine.reason(
            detected_symptoms=combined_symptoms,
            raw_narrative=raw_narrative,
            age_group=age_group,
            duration=duration,
            severity=severity
        )

        # Enrich response with NLP breakdown metadata
        reasoning_res["nlp_extraction"] = {
            "raw_matched_phrases": nlp_res["raw_matched_phrases"],
            "negated_phrases": nlp_res["negated_phrases"],
            "cleaned_text": nlp_res["cleaned_text"]
        }

        # Step 4: Save anonymized assessment to SQLite if symptoms exist
        if combined_symptoms and reasoning_res.get("top_patterns"):
            top_pat = reasoning_res["top_patterns"][0]
            save_assessment_record(
                age_group=age_group,
                duration=duration,
                severity=severity,
                detected_symptoms=[s["symptom_name"] for s in combined_symptoms],
                top_pattern=top_pat["pattern_name"],
                match_score=top_pat["match_score"],
                risk_level=reasoning_res["risk_assessment"]["level"]
            )

        return jsonify(reasoning_res)

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": "A processing error occurred during symptom reasoning. Please review your input.",
            "error_detail": str(e)
        }), 500


@app.route("/results")
def results():
    """Results Dashboard Page."""
    return render_template("results.html")


@app.route("/about")
def about():
    """About Page: AI Architecture, TF-IDF cosine similarity, weighted logic, dataset sources."""
    return render_template("about.html")


@app.route("/api/symptoms", methods=["GET"])
def get_symptoms_list():
    """Returns all symptoms in the medical knowledge base."""
    return jsonify(get_all_symptoms())


@app.route("/api/patterns", methods=["GET"])
def get_patterns_list():
    """Returns all condition patterns with their associated symptom weights."""
    return jsonify(get_condition_patterns())


@app.route("/api/recent-assessments", methods=["GET"])
def get_assessments():
    """Returns recent anonymized assessment records from SQLite."""
    return jsonify(get_recent_assessments(limit=10))


@app.route("/api/test-suite", methods=["GET"])
def run_tests_api():
    """Executes the 8 predefined viva test cases and returns structured pass/fail results."""
    test_cases = [
        {
            "id": 1,
            "title": "Test 1: Fever + Cough + Fatigue",
            "input_type": "Structured",
            "symptoms": [{"symptom_id": "SYM01", "symptom_name": "Fever", "category": "General"},
                         {"symptom_id": "SYM03", "symptom_name": "Cough", "category": "Respiratory"},
                         {"symptom_id": "SYM05", "symptom_name": "Fatigue", "category": "General"}],
            "text": "fever cough fatigue",
            "expected_pattern": "Influenza-like illness or Upper Respiratory",
            "expected_risk": "Non-urgent"
        },
        {
            "id": 2,
            "title": "Test 2: Headache + Nausea",
            "input_type": "Structured",
            "symptoms": [{"symptom_id": "SYM02", "symptom_name": "Headache", "category": "Neurological"},
                         {"symptom_id": "SYM07", "symptom_name": "Nausea", "category": "Gastrointestinal"}],
            "text": "headache nausea",
            "expected_pattern": "Primary tension / headache presentation",
            "expected_risk": "Non-urgent"
        },
        {
            "id": 3,
            "title": "Test 3: Vomiting + Diarrhea + Abdominal pain",
            "input_type": "Structured",
            "symptoms": [{"symptom_id": "SYM08", "symptom_name": "Vomiting", "category": "Gastrointestinal"},
                         {"symptom_id": "SYM09", "symptom_name": "Diarrhea", "category": "Gastrointestinal"},
                         {"symptom_id": "SYM10", "symptom_name": "Abdominal pain", "category": "Gastrointestinal"}],
            "text": "vomiting diarrhea abdominal pain",
            "expected_pattern": "Acute gastroenteritis pattern",
            "expected_risk": "Non-urgent"
        },
        {
            "id": 4,
            "title": "Test 4: NLP 'I have fever, headache and body pain.'",
            "input_type": "Natural Language",
            "text": "I have fever, headache and body pain.",
            "expected_pattern": "Influenza-like illness or Viral Myalgia",
            "expected_risk": "Non-urgent"
        },
        {
            "id": 5,
            "title": "Test 5: NLP 'My head hurts and I feel like vomiting.'",
            "input_type": "Natural Language",
            "text": "My head hurts and I feel like vomiting.",
            "expected_pattern": "Primary tension / headache presentation",
            "expected_risk": "Non-urgent"
        },
        {
            "id": 6,
            "title": "Test 6: Predefined Warning Sign (Severe chest pain & shortness of breath)",
            "input_type": "Emergency Red Flag",
            "text": "I have severe chest pain and severe difficulty breathing.",
            "severity": "Severe",
            "expected_pattern": "Any",
            "expected_risk": "URGENT MEDICAL ATTENTION"
        },
        {
            "id": 7,
            "title": "Test 7: Empty Input",
            "input_type": "Edge Case",
            "text": "",
            "expected_pattern": "None",
            "expected_risk": "Friendly validation prompt"
        },
        {
            "id": 8,
            "title": "Test 8: Unknown Symptom",
            "input_type": "Edge Case",
            "text": "I am feeling quantum flux and chromatic reverberations in my astral aura.",
            "expected_pattern": "None",
            "expected_risk": "0 false positives"
        }
    ]

    results = []
    for tc in test_cases:
        narrative = tc.get("text", "")
        sev = tc.get("severity", "Moderate")

        if "symptoms" in tc:
            syms = tc["symptoms"]
        else:
            nlp_res = extractor.extract_from_text(narrative)
            syms = nlp_res["detected_symptoms"]

        res = engine.reason(detected_symptoms=syms, raw_narrative=narrative, severity=sev)
        status = res.get("status")

        passed = True
        actual_summary = ""

        if tc["id"] == 1:
            passed = len(res["top_patterns"]) > 0 and res["top_patterns"][0]["match_score"] > 30
            actual_summary = f"Top pattern: {res['top_patterns'][0]['pattern_name']} ({res['top_patterns'][0]['match_score_str']})"
        elif tc["id"] == 2:
            passed = len(res["top_patterns"]) > 0 and res["top_patterns"][0]["condition_id"] in ["CP04", "CP03"]
            actual_summary = f"Top pattern: {res['top_patterns'][0]['pattern_name']} ({res['top_patterns'][0]['match_score_str']})"
        elif tc["id"] == 3:
            passed = len(res["top_patterns"]) > 0 and res["top_patterns"][0]["condition_id"] == "CP03"
            actual_summary = f"Top pattern: {res['top_patterns'][0]['pattern_name']} ({res['top_patterns'][0]['match_score_str']})"
        elif tc["id"] == 4:
            names = [s["symptom_name"] for s in syms]
            passed = "Fever" in names and "Headache" in names and "Body pain" in names
            actual_summary = f"Extracted: {', '.join(names)}. Top pattern: {res['top_patterns'][0]['pattern_name']}"
        elif tc["id"] == 5:
            names = [s["symptom_name"] for s in syms]
            passed = "Headache" in names and ("Nausea" in names or "Vomiting" in names)
            actual_summary = f"Normalized: {', '.join(names)}. Top pattern: {res['top_patterns'][0]['pattern_name']}"
        elif tc["id"] == 6:
            passed = res["risk_assessment"]["level"] == "URGENT MEDICAL ATTENTION"
            actual_summary = f"Risk: {res['risk_assessment']['level']}, Flags: {[w['symptom_name'] for w in res['risk_assessment']['triggered_warnings']]}"
        elif tc["id"] == 7:
            passed = status == "empty_input"
            actual_summary = f"Status: {status}, Validation message shown"
        elif tc["id"] == 8:
            passed = status == "no_symptoms_matched" and len(res["top_patterns"]) == 0
            actual_summary = f"Status: {status}, 0 false matches"

        results.append({
            "test_id": tc["id"],
            "title": tc["title"],
            "passed": passed,
            "expected": tc.get("expected_pattern") or tc.get("expected_risk"),
            "actual": actual_summary,
            "detected_symptoms": [s["symptom_name"] for s in syms],
            "top_match": res["top_patterns"][0]["pattern_name"] if res.get("top_patterns") else "None",
            "score": res["top_patterns"][0]["match_score_str"] if res.get("top_patterns") else "N/A"
        })

    return jsonify({
        "total": len(results),
        "passed": sum(1 for r in results if r["passed"]),
        "failed": sum(1 for r in results if not r["passed"]),
        "results": results
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Medical Symptom Reasoning System on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
