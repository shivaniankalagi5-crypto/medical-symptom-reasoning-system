import React, { useState } from "react";
import {
  Database,
  FileCode,
  Copy,
  Check,
  Search,
  BookOpen,
  Layers,
  ChevronRight,
  Download
} from "lucide-react";
import { SYMPTOMS_DATA, CONDITION_PATTERNS } from "../services/knowledgeBase";

const PYTHON_FILES: { name: string; path: string; desc: string; sampleCode: string }[] = [
  {
    name: "reasoning_engine.py",
    path: "ai/reasoning_engine.py",
    desc: "AI Reasoning Engine with weighted knowledge-based matching and explainable AI traces.",
    sampleCode: `"""
AI Reasoning Engine.
Implements knowledge-based weighted symptom-pattern matching combined with
TF-IDF semantic cosine similarity to produce transparent, explainable matches.
"""
from database.database import get_condition_patterns
from ai.text_similarity import calculate_similarity_to_patterns
from ai.risk_assessment import RiskAssessmentEngine

class ReasoningEngine:
    def __init__(self):
        self.patterns = get_condition_patterns()

    def reason(self, detected_symptoms, raw_narrative="", age_group="Adult", duration="1–2 days", severity="Moderate"):
        # 1. Compute NLP TF-IDF Cosine Similarities across all pattern profiles
        similarity_scores = calculate_similarity_to_patterns(raw_narrative, self.patterns)
        
        # 2. Weighted Knowledge-Base Coverage Ratio
        # Score = 0.75 * KB_Coverage + 0.25 * Cosine_Similarity
        # Ranked top 3 patterns with explainability
`
  },
  {
    name: "symptom_extractor.py",
    path: "ai/symptom_extractor.py",
    desc: "NLP symptom extraction with negation handling and phrase normalization.",
    sampleCode: `"""
NLP Symptom Extractor module.
Clause segmentation, contractions expansion, negation handling,
and n-gram phrase normalization to canonical medical entities.
"""
import re
from database.database import get_all_symptoms

CONTRACTIONS = {"i'm": "i am", "don't": "do not", ...}
NEGATION_CUES = ["no", "not", "without", "deny", "never", "free of"]

class SymptomExtractor:
    def extract_from_text(self, raw_text: str):
        # Cleans text, splits clauses, checks negation proximity,
        # matches multi-word phrases and normalizes slang.
`
  },
  {
    name: "risk_assessment.py",
    path: "ai/risk_assessment.py",
    desc: "Rule-based red-flag warning signs detection (syncope, seizures, chest pain).",
    sampleCode: `"""
Risk Assessment Engine.
Evaluates predefined clinical red-flag warning signs and categorizes
symptom severity into informational prototype guidance tiers.
"""
URGENT_WARNING_SYMPTOMS = {
    "SYM22": {"name": "Loss of consciousness", "reason": "Syncope indicates cardiorespiratory compromise."},
    "SYM20": {"name": "Chest pain", "reason": "Requires urgent exclusion of acute thoracic syndromes."},
    ...
}
`
  },
  {
    name: "text_similarity.py",
    path: "ai/text_similarity.py",
    desc: "TF-IDF Vectorization and Cosine Similarity calculation (Scikit-Learn formula).",
    sampleCode: `"""
Text Similarity Engine (TF-IDF and Cosine Similarity).
idf(t) = log((1 + N) / (1 + df(t))) + 1
Cosine similarity = dot product of L2-normalized vectors.
"""
import math, re

class TextSimilarityEngine:
    def fit(self, documents):
        # Computes document frequencies and smooth IDF weights
    def transform(self, text):
        # Computes L2-normalized TF-IDF vector
`
  },
  {
    name: "database.py",
    path: "database/database.py",
    desc: "SQLite database setup, schema generation, CSV seeding, and query methods.",
    sampleCode: `"""
Database module for the Medical Symptom Reasoning System.
Manages the SQLite database initialization and seeding from CSV files.
"""
import sqlite3, csv

def init_database(force_reseed=False):
    # Creates symptoms, condition_patterns, symptom_condition, assessment_records tables
`
  },
  {
    name: "app.py",
    path: "app.py",
    desc: "Flask Web Application with REST API endpoints for symptom reasoning.",
    sampleCode: `"""
Medical Symptom Reasoning System - Flask Web Application
College Artificial Intelligence Mini-Project
"""
from flask import Flask, render_template, request, jsonify
from ai.reasoning_engine import engine
from ai.symptom_extractor import extractor

app = Flask(__name__)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    # Extracts symptoms with NLP, combines with checklist, runs reasoning
`
  },
  {
    name: "test_reasoning.py",
    path: "tests/test_reasoning.py",
    desc: "Comprehensive unittest suite verifying the 8 viva scenarios.",
    sampleCode: `"""
Comprehensive Test Suite for Medical Symptom Reasoning System.
Run: python3 tests/test_reasoning.py
"""
import unittest
from ai.reasoning_engine import engine

class TestMedicalSymptomReasoning(unittest.TestCase):
    def test_01_fever_cough_fatigue(self): ...
    def test_06_predefined_warning_sign(self): ...
`
  }
];

export const KnowledgeBaseView: React.FC = () => {
  const [subTab, setSubTab] = useState<"symptoms" | "patterns" | "code">("patterns");
  const [search, setSearch] = useState<string>("");
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredSymptoms = SYMPTOMS_DATA.filter(
    (s) =>
      s.symptom_name.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPatterns = CONDITION_PATTERNS.filter(
    (p) =>
      p.pattern_name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const copyCurrentCode = () => {
    navigator.clipboard.writeText(PYTHON_FILES[selectedFileIndex].sampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="text-xs font-mono font-semibold uppercase text-sky-700">
          Structured Medical Knowledge & Codebase
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Knowledge Base & Python Files
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Inspect the structured clinical knowledge base and view all Python modules built for Replit or GitHub.
        </p>
      </div>

      {/* Sub Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab("patterns")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            subTab === "patterns"
              ? "bg-sky-700 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Condition Patterns ({CONDITION_PATTERNS.length})</span>
        </button>

        <button
          onClick={() => setSubTab("symptoms")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            subTab === "symptoms"
              ? "bg-sky-700 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Symptoms Dictionary ({SYMPTOMS_DATA.length})</span>
        </button>

        <button
          onClick={() => setSubTab("code")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
            subTab === "code"
              ? "bg-sky-700 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Python Modules for Replit</span>
        </button>
      </div>

      {/* SUBTAB 1: CONDITION PATTERNS */}
      {subTab === "patterns" && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search condition patterns..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredPatterns.map((pat) => (
              <div
                key={pat.condition_id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition hover:border-slate-300"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-mono text-xs font-bold text-sky-700">
                    {pat.condition_id}
                  </span>
                  <span className="text-xs text-slate-400">
                    {pat.symptoms.length} weighted symptoms
                  </span>
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {pat.pattern_name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {pat.description}
                </p>

                <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs">
                  <div className="font-semibold text-slate-800 mb-1 text-[11px] uppercase tracking-wider">
                    Symptom Weights ($w$):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pat.symptoms.map((s) => (
                      <span
                        key={s.symptom_id}
                        className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-700 font-mono"
                      >
                        {s.symptom_name}: <strong>{s.weight}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-[11px] text-slate-500 italic">
                  <strong>Safe Guidance:</strong> {pat.general_guidance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: SYMPTOMS */}
      {subTab === "symptoms" && (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms, categories, synonyms..."
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-hidden"
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="p-3 font-mono">ID</th>
                  <th className="p-3">Symptom Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Synonyms & Vernacular Terms</th>
                  <th className="p-3">Clinical Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSymptoms.map((sym) => (
                  <tr key={sym.symptom_id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-sky-700">{sym.symptom_id}</td>
                    <td className="p-3 font-semibold text-slate-900">{sym.symptom_name}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{sym.category}</td>
                    <td className="p-3 text-slate-600">{sym.synonyms.join(", ")}</td>
                    <td className="p-3 text-slate-600 leading-relaxed">{sym.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PYTHON CODE FOR REPLIT */}
      {subTab === "code" && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* File selector (4 cols) */}
          <div className="space-y-2 md:col-span-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Python Mini-Project Files
            </div>
            {PYTHON_FILES.map((f, idx) => (
              <button
                key={f.path}
                onClick={() => setSelectedFileIndex(idx)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedFileIndex === idx
                    ? "border-sky-500 bg-sky-50/50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{f.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400 font-mono">{f.path}</div>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{f.desc}</p>
              </button>
            ))}
          </div>

          {/* Code preview & copy (8 cols) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-white shadow-sm md:col-span-8 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-sky-400">
                <FileCode className="h-4 w-4" />
                <span>{PYTHON_FILES[selectedFileIndex].path}</span>
              </div>
              <button
                onClick={copyCurrentCode}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <pre className="mt-3 flex-1 overflow-x-auto font-mono text-xs leading-relaxed text-slate-300">
              <code>{PYTHON_FILES[selectedFileIndex].sampleCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
