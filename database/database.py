"""
Database module for the Medical Symptom Reasoning System.
Manages the SQLite database initialization, schema creation, data seeding from CSVs,
and query helpers for knowledge-base access and privacy-conscious assessment logging.
"""

import os
import sqlite3
import csv
from typing import List, Dict, Any, Optional

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "symptoms_kb.db")
DATA_DIR = os.path.join(os.path.dirname(DB_DIR), "data")


def get_db_connection() -> sqlite3.Connection:
    """Creates a connection to the SQLite database with dictionary-like row access."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database(force_reseed: bool = False) -> None:
    """Initializes tables and populates knowledge-base data from CSV files if not already present."""
    os.makedirs(DB_DIR, exist_ok=True)
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")

    # 1. Symptoms Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS symptoms (
            symptom_id TEXT PRIMARY KEY,
            symptom_name TEXT NOT NULL,
            category TEXT NOT NULL,
            synonyms TEXT,
            description TEXT
        );
    """)

    # 2. Condition Patterns Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS condition_patterns (
            condition_id TEXT PRIMARY KEY,
            pattern_name TEXT NOT NULL,
            description TEXT,
            general_guidance TEXT
        );
    """)

    # 3. Symptom-Condition Weights Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS symptom_condition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            condition_id TEXT NOT NULL,
            symptom_id TEXT NOT NULL,
            weight REAL NOT NULL,
            FOREIGN KEY (condition_id) REFERENCES condition_patterns (condition_id) ON DELETE CASCADE,
            FOREIGN KEY (symptom_id) REFERENCES symptoms (symptom_id) ON DELETE CASCADE
        );
    """)

    # 4. Privacy-conscious Assessment Records Table (no personal identifiers)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            age_group TEXT,
            duration TEXT,
            severity TEXT,
            detected_symptoms TEXT,
            top_pattern TEXT,
            match_score REAL,
            risk_level TEXT
        );
    """)

    conn.commit()

    # Seed data if empty or forced
    cursor.execute("SELECT COUNT(*) FROM symptoms;")
    symptoms_count = cursor.fetchone()[0]

    if symptoms_count == 0 or force_reseed:
        _seed_from_csv(conn)

    conn.close()


def _seed_from_csv(conn: sqlite3.Connection) -> None:
    """Seeds the SQLite database tables directly from data/*.csv files."""
    cursor = conn.cursor()

    # Seed Symptoms
    symptoms_csv = os.path.join(DATA_DIR, "symptoms.csv")
    if os.path.exists(symptoms_csv):
        cursor.execute("DELETE FROM symptoms;")
        with open(symptoms_csv, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO symptoms (symptom_id, symptom_name, category, synonyms, description)
                    VALUES (?, ?, ?, ?, ?);
                    """,
                    (row["symptom_id"], row["symptom_name"], row["category"], row["synonyms"], row["description"])
                )

    # Seed Condition Patterns
    conditions_csv = os.path.join(DATA_DIR, "condition_patterns.csv")
    if os.path.exists(conditions_csv):
        cursor.execute("DELETE FROM condition_patterns;")
        with open(conditions_csv, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute(
                    """
                    INSERT OR REPLACE INTO condition_patterns (condition_id, pattern_name, description, general_guidance)
                    VALUES (?, ?, ?, ?);
                    """,
                    (row["condition_id"], row["pattern_name"], row["description"], row["general_guidance"])
                )

    # Seed Symptom-Condition Relationships & Weights
    sym_cond_csv = os.path.join(DATA_DIR, "symptom_condition.csv")
    if os.path.exists(sym_cond_csv):
        cursor.execute("DELETE FROM symptom_condition;")
        with open(sym_cond_csv, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                cursor.execute(
                    """
                    INSERT INTO symptom_condition (condition_id, symptom_id, weight)
                    VALUES (?, ?, ?);
                    """,
                    (row["condition_id"], row["symptom_id"], float(row["weight"]))
                )

    conn.commit()


def get_all_symptoms() -> List[Dict[str, Any]]:
    """Retrieves all symptoms from the knowledge base."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT symptom_id, symptom_name, category, synonyms, description FROM symptoms ORDER BY category, symptom_name;")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_condition_patterns() -> List[Dict[str, Any]]:
    """Retrieves all condition patterns with their associated weighted symptoms."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT condition_id, pattern_name, description, general_guidance FROM condition_patterns ORDER BY pattern_name;")
    patterns = [dict(r) for r in cursor.fetchall()]

    for pattern in patterns:
        cursor.execute("""
            SELECT sc.symptom_id, sc.weight, s.symptom_name, s.category
            FROM symptom_condition sc
            JOIN symptoms s ON sc.symptom_id = s.symptom_id
            WHERE sc.condition_id = ?
            ORDER BY sc.weight DESC;
        """, (pattern["condition_id"],))
        pattern["symptoms"] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return patterns


def save_assessment_record(
    age_group: str,
    duration: str,
    severity: str,
    detected_symptoms: List[str],
    top_pattern: str,
    match_score: float,
    risk_level: str
) -> int:
    """Stores an anonymized, educational assessment summary in the database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO assessment_records (age_group, duration, severity, detected_symptoms, top_pattern, match_score, risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?);
    """, (
        age_group,
        duration,
        severity,
        ", ".join(detected_symptoms),
        top_pattern,
        match_score,
        risk_level
    ))
    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id or 0


def get_recent_assessments(limit: int = 10) -> List[Dict[str, Any]]:
    """Retrieves recent anonymized assessment records for educational review."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, timestamp, age_group, duration, severity, detected_symptoms, top_pattern, match_score, risk_level
        FROM assessment_records
        ORDER BY id DESC
        LIMIT ?;
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


if __name__ == "__main__":
    init_database(force_reseed=True)
    print("Database initialized successfully.")
    print(f"Loaded {len(get_all_symptoms())} symptoms.")
    print(f"Loaded {len(get_condition_patterns())} condition patterns.")
