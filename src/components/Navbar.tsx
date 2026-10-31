import React from "react";
import { Stethoscope, Activity, ArrowRight } from "lucide-react";

interface NavbarProps {
  activeTab: "home" | "assessment" | "results" | "about";
  setActiveTab: (tab: "home" | "assessment" | "results" | "about") => void;
  hasResults: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, hasResults }) => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-sm">
      {/* Zone 1: Brand Mark */}
      <button
        onClick={() => setActiveTab("home")}
        className="flex items-center gap-2.5 text-left text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-teal-800"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
          <Stethoscope className="h-4 w-4" />
        </div>
        <span className="font-semibold text-slate-900">Medical Symptom Reasoning System</span>
      </button>

      {/* Zone 2: Clean User-Facing Navigation */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => setActiveTab("home")}
          className={`transition-colors hover:text-slate-900 ${
            activeTab === "home" ? "font-semibold text-teal-800" : ""
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("assessment")}
          className={`transition-colors hover:text-slate-900 ${
            activeTab === "assessment" ? "font-semibold text-teal-800" : ""
          }`}
        >
          Symptom Check
        </button>
        {hasResults && (
          <button
            onClick={() => setActiveTab("results")}
            className={`transition-colors hover:text-slate-900 ${
              activeTab === "results" ? "font-semibold text-teal-800" : ""
            }`}
          >
            Your Assessment
          </button>
        )}
        <button
          onClick={() => setActiveTab("about")}
          className={`transition-colors hover:text-slate-900 ${
            activeTab === "about" ? "font-semibold text-teal-800" : ""
          }`}
        >
          About
        </button>
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab("assessment")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-teal-800 whitespace-nowrap"
        >
          <span>Start Symptom Check</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
