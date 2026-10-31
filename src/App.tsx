/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { HomeView } from "./components/HomeView";
import { AssessmentView } from "./components/AssessmentView";
import { ResultsView } from "./components/ResultsView";
import { AboutView } from "./components/AboutView";
import { ReasoningOutput } from "./services/reasoningEngine";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "home" | "assessment" | "results" | "about"
  >("home");
  const [currentResult, setCurrentResult] = useState<ReasoningOutput | null>(null);

  const handleAnalysisComplete = (res: ReasoningOutput) => {
    setCurrentResult(res);
    setActiveTab("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStart = () => {
    setActiveTab("assessment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHowItWorks = () => {
    setActiveTab("home");
    setTimeout(() => {
      const el = document.getElementById("how-it-works");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 font-sans antialiased">
      {/* Professional Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        hasResults={currentResult !== null}
      />

      {/* Main Content Viewports */}
      <main className="flex-1">
        {activeTab === "home" && (
          <HomeView onStart={handleStart} onHowItWorks={handleHowItWorks} />
        )}

        {activeTab === "assessment" && (
          <AssessmentView onAnalysisComplete={handleAnalysisComplete} />
        )}

        {activeTab === "results" && (
          <ResultsView
            result={currentResult}
            onNewAssessment={() => {
              setActiveTab("assessment");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {activeTab === "about" && <AboutView />}
      </main>

      {/* Professional Healthcare Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 text-xs text-slate-500">
        <div className="mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className="font-semibold text-slate-800">
              Medical Symptom Reasoning System
            </div>
            <div className="mt-1 text-slate-500">
              Understand your symptoms. Get clear, informative guidance.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-medium">
            <button
              onClick={() => {
                setActiveTab("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-slate-900 transition"
            >
              Home
            </button>
            <button
              onClick={() => {
                setActiveTab("assessment");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-slate-900 transition"
            >
              Symptom Check
            </button>
            <button
              onClick={() => {
                setActiveTab("about");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-slate-900 transition"
            >
              About & Safety
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 mt-6 pt-6 border-t border-slate-200/60 text-center text-[11px] text-slate-400">
          This tool provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional.
        </div>
      </footer>
    </div>
  );
}
