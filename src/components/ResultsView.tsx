import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Info,
  Calendar,
  Clock,
  Printer,
  ChevronRight
} from "lucide-react";
import { ReasoningOutput } from "../services/reasoningEngine";

interface ResultsViewProps {
  result: ReasoningOutput | null;
  onNewAssessment: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onNewAssessment }) => {
  if (!result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-900">No Assessment to Display</h2>
        <p className="mt-2 text-sm text-slate-600">
          Please complete a symptom assessment to view your results.
        </p>
        <button
          onClick={onNewAssessment}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Start Symptom Check</span>
        </button>
      </div>
    );
  }

  const { detected_symptoms, top_patterns, risk_assessment, metadata } = result;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onNewAssessment}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 hover:text-teal-950 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Start a New Assessment</span>
        </button>

        {/* Quiet unboxed metadata: zero-pill compliant */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{metadata.age_group}</span>
          <span aria-hidden="true">·</span>
          <span>Duration: {metadata.duration}</span>
          <span aria-hidden="true">·</span>
          <span>Severity: {metadata.severity}</span>
        </div>
      </div>

      {/* Main Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Your Symptom Assessment
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Informational summary based on the symptoms and duration you reported.
        </p>
      </div>

      {/* SECTION: Warning Signs Evaluation (Section 9) */}
      {risk_assessment.has_urgent_warning ? (
        <div className="mb-8 rounded-xl border border-rose-300 bg-rose-50/80 p-6 shadow-2xs">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-700" />
            <div className="space-y-2">
              <h2 className="text-base font-bold text-rose-950">
                Important: Seek Medical Attention
              </h2>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                Some of the symptoms you reported may require prompt professional evaluation. Please seek appropriate medical or emergency care.
              </p>
              {risk_assessment.triggered_warnings.length > 0 && (
                <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-900">
                  <div className="font-semibold text-rose-950 text-[11px] uppercase tracking-wider mb-1.5">
                    Specific Symptoms of Concern:
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {risk_assessment.triggered_warnings.map((w, idx) => (
                      <li key={idx}>
                        <strong>{w.symptom_name}:</strong> {w.clinical_concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-rose-800 font-medium pt-1">
                Do not wait for symptoms to worsen if you feel unwell or experiencing severe discomfort.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-start gap-3 text-xs">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            <div>
              <div className="font-semibold text-slate-800">
                No urgent warning signs were identified by this tool.
              </div>
              <p className="mt-0.5 text-slate-500 leading-relaxed">
                This does not rule out a medical problem. Seek professional advice if you are concerned or your symptoms worsen.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: Symptoms You Reported */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Symptoms You Reported
        </h2>
        {detected_symptoms.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {detected_symptoms.map((sym) => (
              <div
                key={sym.symptom_id}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-700" />
                <span>{sym.symptom_name}</span>
                <span className="text-[11px] text-slate-400">· {sym.category}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500 italic">No specific symptoms recorded.</p>
        )}
      </section>

      {/* SECTION: Relevant Symptom Patterns (Section 7 & 8) */}
      <section className="mb-8 space-y-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Relevant Symptom Patterns
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Common health patterns that share features with your reported presentation.
          </p>
        </div>

        {top_patterns.map((pat, idx) => {
          const isTop = idx === 0;
          return (
            <div
              key={pat.condition_id}
              className={`rounded-xl border bg-white p-6 shadow-2xs transition ${
                isTop ? "border-teal-300 ring-1 ring-teal-100" : "border-slate-200"
              }`}
            >
              {/* Pattern Title & Match Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-medium text-teal-800">
                    Relevant symptom pattern {idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {pat.pattern_name}
                  </h3>
                </div>

                {/* Score displayed carefully as requested in Section 8 */}
                <div className="sm:text-right">
                  <div className="text-xs font-semibold text-slate-800">
                    Symptom Pattern Match: {pat.match_score_str}
                  </div>
                </div>
              </div>

              {/* Pattern description */}
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {pat.description}
              </p>

              {/* Why this pattern appeared (Section 7) */}
              <div className="mt-4 rounded-lg bg-slate-50/80 p-4 border border-slate-100 text-xs space-y-2">
                <div className="font-semibold text-slate-800">
                  Why this pattern appeared:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {pat.explanation}
                </p>

                {/* Reported symptoms matching */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="font-medium text-slate-700 mb-1.5">
                    Reported symptoms matching:
                  </div>
                  {pat.matched_symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pat.matched_symptoms.map((m) => (
                        <span
                          key={m.symptom_id}
                          className="inline-flex items-center gap-1 text-teal-900 bg-teal-50/80 px-2 py-0.5 rounded text-xs font-medium"
                        >
                          ✓ {m.symptom_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None direct</span>
                  )}
                </div>

                {pat.missing_symptoms.length > 0 && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <span className="font-medium text-slate-600">Other symptoms often associated with this pattern:</span>{" "}
                    {pat.missing_symptoms.join(", ")}
                  </div>
                )}
              </div>

              {/* Subtle score explanation (Section 8) */}
              <div className="mt-3 text-[11px] text-slate-400">
                This score represents how closely the reported symptoms match the symptom pattern used by this tool. It is not a diagnosis or disease probability.
              </div>
            </div>
          );
        })}
      </section>

      {/* SECTION: What you can do next (Section 10) */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          What You Can Do Next
        </h2>

        <div className="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
            <div>
              <strong>Monitor how your symptoms change.</strong> Keep track of whether your symptoms are improving, staying the same, or becoming more uncomfortable over the next 24 to 48 hours.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
            <div>
              <strong>Consider speaking with a healthcare professional</strong> if symptoms persist, worsen, or cause concern. A doctor can perform a physical examination and diagnostic evaluation.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
            <div>
              <strong>Seek urgent medical care</strong> if severe or concerning symptoms develop, such as acute breathing difficulty, intense chest pain, or sudden confusion.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
            <div>
              <strong>Practice supportive care.</strong> Stay hydrated with plenty of fluids, ensure adequate rest, and avoid strenuous physical exertion while you recover.
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Professional Disclaimer (Section 11) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs text-slate-600 leading-relaxed">
        <p>
          <strong className="text-slate-800">Important:</strong> This tool provides general informational guidance based on the symptoms you enter. It does not provide a medical diagnosis and cannot replace evaluation by a qualified healthcare professional. Always consult a licensed doctor for personal medical advice, diagnosis, and treatment.
        </p>
      </div>
    </div>
  );
};
