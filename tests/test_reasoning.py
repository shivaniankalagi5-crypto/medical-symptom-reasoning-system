"""
Comprehensive Test Suite for Medical Symptom Reasoning System.
Validates the AI reasoning, NLP extraction, risk assessment, and edge cases
prescribed in the project specification.

To run:
    python3 tests/test_reasoning.py
"""

import os
import sys
import unittest

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from database.database import init_database
from ai.symptom_extractor import extractor
from ai.reasoning_engine import engine
from ai.risk_assessment import RiskAssessmentEngine


class TestMedicalSymptomReasoning(unittest.TestCase):
    """Automated test cases for college project viva evaluation."""

    @classmethod
    def setUpClass(cls):
        """Ensure database is seeded and ready."""
        init_database(force_reseed=False)

    def test_01_fever_cough_fatigue(self):
        """Test 1: Fever + Cough + Fatigue (Structured Symptoms)."""
        input_symptoms = [
            {"symptom_id": "SYM01", "symptom_name": "Fever", "category": "General"},
            {"symptom_id": "SYM03", "symptom_name": "Cough", "category": "Respiratory"},
            {"symptom_id": "SYM05", "symptom_name": "Fatigue", "category": "General"}
        ]
        res = engine.reason(detected_symptoms=input_symptoms, raw_narrative="fever cough fatigue")

        self.assertEqual(res["status"], "success")
        self.assertGreaterEqual(len(res["top_patterns"]), 1)
        top_pattern = res["top_patterns"][0]

        # Expected: Influenza-like illness or Acute respiratory presentation
        self.assertIn(top_pattern["condition_id"], ["CP01", "CP02", "CP07"])
        self.assertGreater(top_pattern["match_score"], 40.0)
        self.assertEqual(res["risk_assessment"]["has_urgent_warning"], False)

        print("\n[PASS] Test 1: Fever + Cough + Fatigue")
        print(f"       Top Match: {top_pattern['pattern_name']} ({top_pattern['match_score_str']})")

    def test_02_headache_nausea(self):
        """Test 2: Headache + Nausea."""
        input_symptoms = [
            {"symptom_id": "SYM02", "symptom_name": "Headache", "category": "Neurological"},
            {"symptom_id": "SYM07", "symptom_name": "Nausea", "category": "Gastrointestinal"}
        ]
        res = engine.reason(detected_symptoms=input_symptoms, raw_narrative="headache and nausea")

        self.assertEqual(res["status"], "success")
        top_pattern = res["top_patterns"][0]
        # Expected: Primary tension / headache presentation (CP04) or Gastroenteritis (CP03)
        self.assertIn(top_pattern["condition_id"], ["CP04", "CP03"])
        self.assertGreater(top_pattern["match_score"], 35.0)

        print("\n[PASS] Test 2: Headache + Nausea")
        print(f"       Top Match: {top_pattern['pattern_name']} ({top_pattern['match_score_str']})")

    def test_03_vomiting_diarrhea_abdominal_pain(self):
        """Test 3: Vomiting + Diarrhea + Abdominal Pain."""
        input_symptoms = [
            {"symptom_id": "SYM08", "symptom_name": "Vomiting", "category": "Gastrointestinal"},
            {"symptom_id": "SYM09", "symptom_name": "Diarrhea", "category": "Gastrointestinal"},
            {"symptom_id": "SYM10", "symptom_name": "Abdominal pain", "category": "Gastrointestinal"}
        ]
        res = engine.reason(detected_symptoms=input_symptoms, raw_narrative="vomiting diarrhea abdominal pain")

        self.assertEqual(res["status"], "success")
        top_pattern = res["top_patterns"][0]
        # Expected: Acute gastroenteritis pattern (CP03)
        self.assertEqual(top_pattern["condition_id"], "CP03")
        self.assertGreater(top_pattern["match_score"], 50.0)

        print("\n[PASS] Test 3: Vomiting + Diarrhea + Abdominal pain")
        print(f"       Top Match: {top_pattern['pattern_name']} ({top_pattern['match_score_str']})")

    def test_04_nlp_fever_headache_body_pain(self):
        """Test 4: Natural Language: 'I have fever, headache and body pain.'"""
        narrative = "I have fever, headache and body pain."
        nlp_res = extractor.extract_from_text(narrative)
        extracted_names = [s["symptom_name"] for s in nlp_res["detected_symptoms"]]

        self.assertIn("Fever", extracted_names)
        self.assertIn("Headache", extracted_names)
        self.assertIn("Body pain", extracted_names)

        res = engine.reason(detected_symptoms=nlp_res["detected_symptoms"], raw_narrative=narrative)
        self.assertEqual(res["status"], "success")
        top_pattern = res["top_patterns"][0]
        self.assertIn(top_pattern["condition_id"], ["CP01", "CP06", "CP04"])

        print("\n[PASS] Test 4: NLP 'I have fever, headache and body pain.'")
        print(f"       Extracted Symptoms: {', '.join(extracted_names)}")
        print(f"       Top Match: {top_pattern['pattern_name']} ({top_pattern['match_score_str']})")

    def test_05_nlp_head_hurts_throwing_up(self):
        """Test 5: Natural Language: 'My head hurts and I feel like vomiting.'"""
        narrative = "My head hurts and I feel like vomiting."
        nlp_res = extractor.extract_from_text(narrative)
        extracted_names = [s["symptom_name"] for s in nlp_res["detected_symptoms"]]

        # Should normalize 'head hurts' -> Headache, and 'feel like vomiting' -> Nausea
        self.assertIn("Headache", extracted_names)
        self.assertTrue("Nausea" in extracted_names or "Vomiting" in extracted_names)

        res = engine.reason(detected_symptoms=nlp_res["detected_symptoms"], raw_narrative=narrative)
        self.assertEqual(res["status"], "success")

        print("\n[PASS] Test 5: NLP 'My head hurts and I feel like vomiting.'")
        print(f"       Normalized Symptoms: {', '.join(extracted_names)}")
        print(f"       Top Match: {res['top_patterns'][0]['pattern_name']}")

    def test_06_predefined_warning_sign(self):
        """Test 6: Input containing a predefined warning sign (Severe chest pain / Shortness of breath)."""
        narrative = "I have severe chest pain and severe difficulty breathing."
        nlp_res = extractor.extract_from_text(narrative)
        res = engine.reason(
            detected_symptoms=nlp_res["detected_symptoms"],
            raw_narrative=narrative,
            severity="Severe"
        )

        risk = res["risk_assessment"]
        self.assertEqual(risk["level"], "URGENT MEDICAL ATTENTION")
        self.assertTrue(risk["has_urgent_warning"])
        self.assertGreater(len(risk["triggered_warnings"]), 0)

        print("\n[PASS] Test 6: Predefined Warning Sign Detection")
        print(f"       Risk Level: {risk['level']}")
        print(f"       Flags Detected: {[w['symptom_name'] for w in risk['triggered_warnings']]}")

    def test_07_empty_input(self):
        """Test 7: Empty input handling."""
        res = engine.reason(detected_symptoms=[], raw_narrative="", severity="Mild")

        self.assertEqual(res["status"], "empty_input")
        self.assertEqual(len(res["top_patterns"]), 0)
        self.assertIn("No symptoms were provided", res["message"])

        print("\n[PASS] Test 7: Empty input handled gracefully with friendly validation message.")

    def test_08_unknown_symptom(self):
        """Test 8: Unknown symptom handling."""
        narrative = "I am feeling quantum flux and chromatic reverberations in my astral aura."
        nlp_res = extractor.extract_from_text(narrative)

        # No medical symptoms in the knowledge base should match this gibberish
        self.assertEqual(len(nlp_res["detected_symptoms"]), 0)

        res = engine.reason(detected_symptoms=nlp_res["detected_symptoms"], raw_narrative=narrative)
        self.assertEqual(res["status"], "no_symptoms_matched")
        self.assertEqual(len(res["top_patterns"]), 0)
        self.assertIn("No recognized medical symptoms", res["message"])

        print("\n[PASS] Test 8: Unknown non-medical symptoms correctly yielded 0 false positives.")


if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING VIVA TEST SUITE: MEDICAL SYMPTOM REASONING SYSTEM")
    print("=" * 70)
    unittest.main(verbosity=2)
