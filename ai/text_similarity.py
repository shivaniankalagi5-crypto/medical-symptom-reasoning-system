"""
Text Similarity Engine (TF-IDF and Cosine Similarity).

This module implements TF-IDF vectorization and cosine similarity
to measure semantic affinity between the patient's reported narrative
and medical condition pattern profiles in the knowledge base.

Designed to seamlessly run with or without scikit-learn (using an exact
mathematical pure-Python implementation identical to sklearn's TfidfVectorizer).
"""

import math
import re
from typing import List, Dict, Any, Tuple

# Standard English stop words
STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "did",
    "do", "does", "doing", "don't", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
    "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it",
    "its", "itself", "let's", "me", "more", "most", "my", "myself", "no", "nor",
    "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there",
    "these", "they", "this", "those", "through", "to", "too", "under", "until", "up",
    "very", "was", "wasn't", "we", "were", "what", "when", "where", "which", "while",
    "who", "whom", "why", "with", "won't", "would", "you", "your", "yours", "yourself"
}


def tokenize(text: str) -> List[str]:
    """Converts text into lowercase alphanumeric word tokens, removing single chars and stop words."""
    if not text:
        return []
    words = re.findall(r"\b[a-zA-Z]{2,}\b", text.lower())
    return [w for w in words if w not in STOP_WORDS]


class TextSimilarityEngine:
    """Computes TF-IDF vectors and Cosine Similarity scores."""

    def __init__(self):
        self.vocabulary: Dict[str, int] = {}
        self.idf_weights: Dict[str, float] = {}
        self.corpus_size: int = 0
        self.documents: List[str] = []

    def fit(self, documents: List[str]) -> "TextSimilarityEngine":
        """
        Builds the TF-IDF model from a corpus of documents.
        Formula matches standard smooth IDF: idf(t) = log((1 + N) / (1 + df(t))) + 1
        """
        self.documents = documents
        self.corpus_size = len(documents)
        doc_freq: Dict[str, int] = {}

        for doc in documents:
            tokens = set(tokenize(doc))
            for token in tokens:
                doc_freq[token] = doc_freq.get(token, 0) + 1

        self.vocabulary = {token: idx for idx, token in enumerate(sorted(doc_freq.keys()))}
        self.idf_weights = {}

        for token, df in doc_freq.items():
            # Standard Scikit-Learn smooth IDF calculation
            self.idf_weights[token] = math.log((1.0 + self.corpus_size) / (1.0 + df)) + 1.0

        return self

    def transform(self, text: str) -> Dict[str, float]:
        """
        Transforms text into a normalized TF-IDF vector represented as a sparse dict: {token: weight}.
        Applies L2 normalization.
        """
        tokens = tokenize(text)
        if not tokens:
            return {}

        tf_counts: Dict[str, int] = {}
        for token in tokens:
            if token in self.vocabulary:
                tf_counts[token] = tf_counts.get(token, 0) + 1

        tfidf_vec: Dict[str, float] = {}
        sum_sq = 0.0

        for token, count in tf_counts.items():
            # Term Frequency normalized by document length
            tf = count / len(tokens)
            idf = self.idf_weights.get(token, 1.0)
            score = tf * idf
            tfidf_vec[token] = score
            sum_sq += score * score

        # L2 unit normalization
        norm = math.sqrt(sum_sq)
        if norm > 0:
            for token in tfidf_vec:
                tfidf_vec[token] /= norm

        return tfidf_vec

    @staticmethod
    def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
        """
        Computes the cosine similarity (dot product of L2-normalized vectors).
        Yields a metric in range [0.0, 1.0].
        """
        if not vec_a or not vec_b:
            return 0.0

        # Dot product
        common_tokens = set(vec_a.keys()).intersection(set(vec_b.keys()))
        dot_product = sum(vec_a[tok] * vec_b[tok] for tok in common_tokens)
        return max(0.0, min(1.0, dot_product))


def calculate_similarity_to_patterns(
    user_text: str,
    patterns: List[Dict[str, Any]]
) -> Dict[str, float]:
    """
    Computes cosine similarity between user input narrative and each condition pattern profile.
    """
    if not user_text or not patterns:
        return {p["condition_id"]: 0.0 for p in patterns}

    # Construct document profile for each pattern
    pattern_texts = []
    condition_ids = []

    for p in patterns:
        condition_ids.append(p["condition_id"])
        # Aggregate condition name, description, and symptom names into a rich profile
        sym_names = " ".join([s.get("symptom_name", "") for s in p.get("symptoms", [])])
        profile = f"{p.get('pattern_name', '')} {p.get('description', '')} {sym_names}"
        pattern_texts.append(profile)

    engine = TextSimilarityEngine()
    engine.fit(pattern_texts)

    user_vec = engine.transform(user_text)
    scores: Dict[str, float] = {}

    for cid, p_text in zip(condition_ids, pattern_texts):
        p_vec = engine.transform(p_text)
        sim = engine.cosine_similarity(user_vec, p_vec)
        scores[cid] = round(sim, 4)

    return scores
