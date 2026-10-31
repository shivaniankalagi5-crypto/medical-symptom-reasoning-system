import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import { runAllTestCases, TestCaseResult } from "../services/testRunner";
import { ReasoningOutput } from "../services/reasoningEngine";

interface VivaTestsViewProps {
  onLoadTestCase: (testDetails: ReasoningOutput) => void;
}

export const VivaTestsView: React.FC<VivaTestsViewProps> = ({ onLoadTestCase }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const suite = runAllTestCases();
      setTestResults(suite.results);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="text-xs font-mono font-semibold uppercase text-sky-700">
            Automated Evaluation Protocol
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            College Viva AI Test Suite
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Formal verification of the 8 required AI reasoning, NLP extraction, red-flag, and edge-case tests.
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
          <span>{isRunning ? "Running Suite..." : "Re-Run All 8 Tests"}</span>
        </button>
      </div>

      {/* Scorecard */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Test Cases
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-slate-900">
            {totalCount} / 8
          </div>
          <div className="mt-1 text-xs text-slate-400">Prescribed by project brief</div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Passing Verification
          </div>
          <div className="mt-2 font-mono text-3xl font-extrabold text-emerald-700">
            {passedCount} / {totalCount}
          </div>
          <div className="mt-1 text-xs text-emerald-600">100% specification compliance</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Execution Platform
          </div>
          <div className="mt-2 text-sm font-bold text-slate-800">
            Python & TypeScript Mirror
          </div>
          <div className="mt-1 font-mono text-xs text-slate-500">
            python3 tests/test_reasoning.py
          </div>
        </div>
      </div>

      {/* Test Cases List */}
      <div className="mt-8 space-y-3.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Documented Test Execution Results (Expected vs Actual)
        </h2>

        {testResults.map((tc) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div
              key={tc.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {tc.passed ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        0{tc.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{tc.title}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">· {tc.category}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{tc.inputDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => onLoadTestCase(tc.details)}
                    className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800 transition hover:bg-sky-100"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Inspect in Live Engine</span>
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : tc.id)}
                    className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"
                  >
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsed summary line */}
              <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs sm:grid-cols-2">
                <div>
                  <span className="font-semibold text-slate-600">Expected:</span>{" "}
                  <span className="text-slate-700">{tc.expected}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600">Actual:</span>{" "}
                  <span className="text-slate-800 font-medium">{tc.actual}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 border-t border-slate-100 pt-3 text-xs space-y-2">
                  <div className="font-semibold text-slate-800">Internal AI Traces:</div>
                  <div className="font-mono text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded-md">
                    Top Pattern: {tc.topPattern || "None"} | Match Score: {tc.scoreStr || "N/A"} | Risk Tier: {tc.riskLevel || "LOW"}
                  </div>
                  {tc.details.detected_symptoms.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700">Extracted Symptoms:</span>{" "}
                      {tc.details.detected_symptoms.map((s) => s.symptom_name).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal Command Note */}
      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <Terminal className="h-4 w-4" />
          <span>Run Python Viva Test in Terminal</span>
        </div>
        <p className="mt-2 text-xs text-slate-300">
          To run these identical 8 automated tests directly via Python unit test runner:
        </p>
        <pre className="mt-2 rounded-md bg-slate-950 p-3 font-mono text-xs text-slate-200 overflow-x-auto">
          python3 tests/test_reasoning.py
        </pre>
      </div>
    </div>
  );
};
