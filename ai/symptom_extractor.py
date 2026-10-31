"""
Natural Language Processing (NLP) Symptom Extractor module.

Responsible for:
1. Cleaning and standardizing natural language free-text input.
2. Handling common English contractions and negations (e.g., "no fever", "not vomiting").
3. N-gram phrase extraction and synonym matching against the medical dictionary.
4. Normalizing vernacular phrases into standardized medical symptom entities.
"""

import re
import os
import sys
from typing import List, Dict, Any, Set, Tuple

# Ensure database module is accessible
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.database import get_all_symptoms

# Common contractions dictionary for text cleaning
CONTRACTIONS = {
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
}

# Negation prefix cues in English
NEGATION_CUES = [
    "no", "not", "without", "deny", "denies", "denied",
    "never", "free of", "don't have", "do not have", "neither", "nor"
]


def clean_text(text: str) -> str:
    """Preprocesses and normalizes raw user text."""
    if not text:
        return ""
    text = text.lower().strip()
    for contr, expanded in CONTRACTIONS.items():
        text = text.replace(contr, expanded)
    # Remove excessive punctuation while keeping clause delimiters (periods, commas)
    text = re.sub(r"[^\w\s\.,;!?\-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text


class SymptomExtractor:
    """NLP Symptom Extraction and Normalization engine."""

    def __init__(self):
        self._symptoms_kb: List[Dict[str, Any]] = []
        self._phrase_to_symptom: Dict[str, Dict[str, Any]] = {}
        self.load_knowledge_base()

    def load_knowledge_base(self):
        """Loads symptoms and constructs a reverse lookup dictionary of phrases to symptom entities."""
        try:
            self._symptoms_kb = get_all_symptoms()
        except Exception:
            self._symptoms_kb = []

        self._phrase_to_symptom = {}

        for sym in self._symptoms_kb:
            canonical_name = sym["symptom_name"].lower().strip()
            self._phrase_to_symptom[canonical_name] = sym

            # Split synonyms from CSV
            synonyms_str = sym.get("synonyms") or ""
            synonyms = [s.strip().lower() for s in synonyms_str.split(",") if s.strip()]
            for syn in synonyms:
                self._phrase_to_symptom[syn] = sym

        # Add domain vernacular phrases mapped to canonical entities
        extra_vernacular = {
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
        }

        for phrase, target_name in extra_vernacular.items():
            matching_sym = next((s for s in self._symptoms_kb if s["symptom_name"].lower() == target_name), None)
            if matching_sym:
                self._phrase_to_symptom[phrase] = matching_sym

    def _split_into_clauses(self, text: str) -> List[str]:
        """Splits text into clauses by sentence and coordinating conjunctions."""
        raw_clauses = re.split(r"[\.,;!?\n]|(\band\b)|(\bbut\b)|(\balso\b)", text)
        clauses = []
        for c in raw_clauses:
            if c and c.strip() and c.strip() not in ["and", "but", "also"]:
                clauses.append(c.strip())
        return clauses

    def _is_negated(self, clause: str, match_phrase: str) -> bool:
        """Determines if a matched symptom phrase is preceded by a negation cue in the same clause."""
        idx = clause.find(match_phrase)
        if idx == -1:
            return False
        preceding_text = clause[:idx].strip()
        tokens = preceding_text.split()
        # Check last 3 tokens before the symptom
        last_tokens = tokens[-3:] if len(tokens) >= 3 else tokens
        for cue in NEGATION_CUES:
            if cue in " ".join(last_tokens):
                return True
        return False

    def extract_from_text(self, raw_text: str) -> Dict[str, Any]:
        """
        Processes natural-language input and extracts detected medical symptoms.
        Returns a dictionary containing:
        - detected_symptoms: List of standardized symptom objects
        - raw_matched_phrases: Phrases that triggered the matches
        - negated_phrases: Detected symptoms that were negated by user
        - cleaned_text: Normalized input string
        """
        cleaned = clean_text(raw_text)
        if not cleaned:
            return {
                "detected_symptoms": [],
                "raw_matched_phrases": [],
                "negated_phrases": [],
                "cleaned_text": ""
            }

        clauses = self._split_into_clauses(cleaned)
        matched_symptom_ids: Set[str] = set()
        detected_list: List[Dict[str, Any]] = []
        raw_matched_phrases: List[str] = []
        negated_phrases: List[str] = []

        # Sort phrase lookup keys by length descending to match longest phrases first (e.g., 'feel like throwing up' before 'throwing up')
        sorted_phrases = sorted(self._phrase_to_symptom.keys(), key=lambda x: len(x), reverse=True)

        for clause in clauses:
            for phrase in sorted_phrases:
                # Use word-boundary regex for the phrase
                pattern = r"(?:\b|^)" + re.escape(phrase) + r"(?:\b|$)"
                if re.search(pattern, clause):
                    sym = self._phrase_to_symptom[phrase]
                    sym_id = sym["symptom_id"]

                    if self._is_negated(clause, phrase):
                        negated_phrases.append(f"{phrase} ({sym['symptom_name']})")
                    else:
                        if sym_id not in matched_symptom_ids:
                            matched_symptom_ids.add(sym_id)
                            detected_list.append({
                                "symptom_id": sym_id,
                                "symptom_name": sym["symptom_name"],
                                "category": sym["category"],
                                "matched_phrase": phrase,
                                "description": sym.get("description", "")
                            })
                            raw_matched_phrases.append(phrase)

        return {
            "detected_symptoms": detected_list,
            "raw_matched_phrases": raw_matched_phrases,
            "negated_phrases": negated_phrases,
            "cleaned_text": cleaned
        }

    def combine_with_manual_selection(
        self,
        nlp_detected: List[Dict[str, Any]],
        manual_symptom_ids: List[str]
    ) -> List[Dict[str, Any]]:
        """Combines and deduplicates symptoms extracted from NLP and manually selected checkboxes."""
        combined_dict: Dict[str, Dict[str, Any]] = {s["symptom_id"]: s for s in nlp_detected}

        for sym_id in manual_symptom_ids:
            if sym_id not in combined_dict:
                kb_sym = next((s for s in self._symptoms_kb if s["symptom_id"] == sym_id), None)
                if kb_sym:
                    combined_dict[sym_id] = {
                        "symptom_id": kb_sym["symptom_id"],
                        "symptom_name": kb_sym["symptom_name"],
                        "category": kb_sym["category"],
                        "matched_phrase": "manual_selection",
                        "description": kb_sym.get("description", "")
                    }

        return list(combined_dict.values())


# Global extractor instance
extractor = SymptomExtractor()
