import React, { useState } from "react";
import {
  ShieldCheck,
  HeartPulse,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle
} from "lucide-react";

export const AboutView: React.FC = () => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          About Medical Symptom Reasoning System
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          Helping people understand their symptoms and make informed decisions about their healthcare.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Purpose */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">
            Our Purpose
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            This tool is designed to help users organize and understand information about symptoms they are experiencing. It analyzes the symptoms provided by the user and identifies relevant symptom patterns while providing clear explanations and general guidance.
          </p>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Many people find medical terminology confusing or feel unsure whether their symptoms warrant a routine doctor's visit or prompt care. Our goal is to provide a structured, easy-to-use informational overview that prepares you for productive conversations with your doctor.
          </p>
        </section>

        {/* How It Works */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">
            How the System Works
          </h2>
          <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-600">
            <div>
              <strong className="text-slate-800 block font-semibold">1. Natural Symptom Understanding</strong>
              <p className="mt-1 leading-relaxed">
                You can describe your symptoms in your own conversational words. The system identifies recognizable health expressions, resolves everyday descriptions, and filters out negative statements (such as "no cough").
              </p>
            </div>

            <div>
              <strong className="text-slate-800 block font-semibold">2. Pattern Correlation</strong>
              <p className="mt-1 leading-relaxed">
                Rather than treating each symptom in isolation, the tool analyzes how symptoms present together. It references clinical patterns commonly observed in outpatient medicine to identify relevant presentations.
              </p>
            </div>

            <div>
              <strong className="text-slate-800 block font-semibold">3. Safety Screening for Warning Signs</strong>
              <p className="mt-1 leading-relaxed">
                The system checks for critical warning signs—such as acute chest pain, severe shortness of breath, or sudden fainting—and alerts users to seek prompt emergency or urgent evaluation.
              </p>
            </div>
          </div>
        </section>

        {/* Limitations & Responsible Use */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">
            Limitations & Responsible Use
          </h2>
          <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              <strong>Informational Guidance Only:</strong> This application is not a diagnostic device and cannot establish a clinical diagnosis.
            </li>
            <li>
              <strong>No Prescription Medication:</strong> We do not prescribe medication, recommend pharmaceuticals, or advise on dosages.
            </li>
            <li>
              <strong>Always Consult a Professional:</strong> Never delay or disregard professional medical advice based on information provided by this tool.
            </li>
          </ul>
        </section>

        {/* Privacy & Confidentiality */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">
            Privacy & Confidentiality
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your privacy is strictly respected. This tool does not require an account, does not collect personal names, email addresses, or phone numbers, and does not store identifiable health records. Assessments are processed anonymously.
          </p>
        </section>

        {/* Discreet Reviewer / Technical Reference Accordion */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <span>Technical Reference & Research Documentation</span>
            {showTechnicalDetails ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-3">
              <p>
                <strong>System Implementation Details:</strong> The reasoning pipeline uses natural language entity extraction with negation parsing, smooth TF-IDF cosine similarity, and knowledge-based weighted evidence scoring ($w \in [0.10, 0.95]$).
              </p>
              <p>
                <strong>Test Suite & Verification:</strong> Automated verification suites are maintained in the project codebase (`tests/test_reasoning.py`), verifying symptom extraction, synonym normalization, warning-sign detection, and edge cases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
