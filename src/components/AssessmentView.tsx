import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Check,
  Stethoscope,
  ChevronDown
} from "lucide-react";
import { SYMPTOMS_DATA, Symptom } from "../services/knowledgeBase";
import { extractFromText, combineWithManualSelection } from "../services/symptomExtractor";
import { reasonSymptoms, ReasoningOutput } from "../services/reasoningEngine";

interface AssessmentViewProps {
  onAnalysisComplete: (result: ReasoningOutput) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onAnalysisComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [ageGroup, setAgeGroup] = useState<string>("Adult");
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [narrative, setNarrative] = useState<string>("");
  const [duration, setDuration] = useState<string>("1–2 days");
  const [severity, setSeverity] = useState<string>("Moderate");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>("Understanding your symptoms...");
  const [validationError, setValidationError] = useState<string>("");

  // Categories for symptom filtering
  const categories = useMemo(() => {
    const list = Array.from(new Set(SYMPTOMS_DATA.map((s) => s.category)));
    return ["all", ...list];
  }, []);

  // Filtered symptoms
  const filteredSymptoms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SYMPTOMS_DATA.filter((sym) => {
      const matchCat = activeCategory === "all" || sym.category.toLowerCase() === activeCategory.toLowerCase();
      const matchQuery =
        !q ||
        sym.symptom_name.toLowerCase().includes(q) ||
        sym.category.toLowerCase().includes(q) ||
        sym.synonyms.some((syn) => syn.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [searchQuery, activeCategory]);

  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleReset = () => {
    setCurrentStep(1);
    setAgeGroup("Adult");
    setSelectedSymptomIds([]);
    setNarrative("");
    setDuration("1–2 days");
    setSeverity("Moderate");
    setSearchQuery("");
    setActiveCategory("all");
    setValidationError("");
  };

  // Sample quick-fill helper (discreet, professional, not "College Demo")
  const loadSampleProfile = (type: string) => {
    handleReset();
    if (type === "cold") {
      setSelectedSymptomIds(["SYM01", "SYM03", "SYM05"]);
      setNarrative("I have had a mild fever and cough for two days and feel quite fatigued.");
      setAgeGroup("Adult");
      setDuration("1–2 days");
      setSeverity("Moderate");
      setCurrentStep(3);
    } else if (type === "headache") {
      setSelectedSymptomIds(["SYM02", "SYM07"]);
      setNarrative("Throbbing headache and persistent nausea making it hard to look at bright light.");
      setAgeGroup("Adult");
      setDuration("1–2 days");
      setSeverity("Moderate");
      setCurrentStep(3);
    } else if (type === "digestive") {
      setSelectedSymptomIds(["SYM08", "SYM09", "SYM10"]);
      setNarrative("Severe stomach cramps with vomiting and watery diarrhea since yesterday.");
      setAgeGroup("Adult");
      setDuration("1–2 days");
      setSeverity("Moderate");
      setCurrentStep(3);
    } else if (type === "urgent") {
      setSelectedSymptomIds(["SYM20", "SYM19"]);
      setNarrative("Severe crushing chest pain and shortness of breath.");
      setAgeGroup("Adult");
      setDuration("Less than 1 day");
      setSeverity("Severe");
      setCurrentStep(3);
    }
  };

  const triggerAnalysis = () => {
    setValidationError("");

    // Validate that at least one symptom or text was provided
    if (selectedSymptomIds.length === 0 && !narrative.trim()) {
      setValidationError("Please select at least one symptom or describe what you are experiencing.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisPhase("Understanding your symptoms...");

    // Timed professional analysis progression
    setTimeout(() => {
      setAnalysisPhase("Reviewing related symptom patterns...");
    }, 400);

    setTimeout(() => {
      setAnalysisPhase("Checking for important warning signs...");
    }, 800);

    setTimeout(() => {
      setAnalysisPhase("Preparing your results...");
    }, 1200);

    setTimeout(() => {
      const nlpRes = extractFromText(narrative);
      const combined = combineWithManualSelection(nlpRes.detected_symptoms, selectedSymptomIds);
      const output = reasonSymptoms(combined, narrative, ageGroup, duration, severity);

      setIsAnalyzing(false);
      onAnalysisComplete(output);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Symptom Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Follow the steps below to record your symptoms and receive personalized pattern insights.
          </p>
        </div>

        {/* Discreet sample profile selector for testing */}
        <div className="self-start sm:self-auto">
          <div className="relative inline-block text-left">
            <select
              aria-label="Load a sample profile"
              onChange={(e) => {
                if (e.target.value) {
                  loadSampleProfile(e.target.value);
                  e.target.value = "";
                }
              }}
              defaultValue=""
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 focus:outline-hidden"
            >
              <option value="" disabled>
                Load sample profile...
              </option>
              <option value="cold">Seasonal respiratory presentation</option>
              <option value="headache">Headache & nausea presentation</option>
              <option value="digestive">Digestive discomfort presentation</option>
              <option value="urgent">Urgent warning sign example</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step Progress Tracker */}
      <div className="mt-8 mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
          <span>Step {currentStep} of 5</span>
          <span>
            {currentStep === 1 && "About You"}
            {currentStep === 2 && "Select Symptoms"}
            {currentStep === 3 && "Detailed Description"}
            {currentStep === 4 && "Symptom Duration"}
            {currentStep === 5 && "Severity"}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-700 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Guided Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
        {/* STEP 1: About You */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Step 1
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Tell us about yourself
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Age considerations help provide age-appropriate symptom pattern insights.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: "Child", sub: "Under 13 years" },
                { label: "Teenager", sub: "13 – 18 years" },
                { label: "Adult", sub: "19 – 64 years" },
                { label: "Older Adult", sub: "65 years and older" }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAgeGroup(item.label)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                    ageGroup === item.label
                      ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold text-sm text-slate-900">{item.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: What symptoms are you experiencing? */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Step 2
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                What symptoms are you experiencing?
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Select any symptoms that apply. You can also describe them in your own words in the next step.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symptoms (e.g. fever, headache, cough)..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 shadow-2xs focus:border-teal-700 focus:outline-hidden"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-md px-3 py-1 font-medium capitalize whitespace-nowrap transition ${
                    activeCategory === cat
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat === "all" ? "All Symptoms" : cat}
                </button>
              ))}
            </div>

            {/* Symptom Selection List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-lg p-2">
              {filteredSymptoms.map((sym) => {
                const isSelected = selectedSymptomIds.includes(sym.symptom_id);
                return (
                  <div
                    key={sym.symptom_id}
                    onClick={() => toggleSymptom(sym.symptom_id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? "border-teal-700 bg-teal-50/60"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                        isSelected
                          ? "border-teal-700 bg-teal-700 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{sym.symptom_name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{sym.category}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                        {sym.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSymptomIds.length > 0 && (
              <div className="text-xs text-slate-600 pt-1">
                <span className="font-semibold text-slate-800">{selectedSymptomIds.length}</span> symptom{selectedSymptomIds.length > 1 ? "s" : ""} selected
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Tell us more (Natural language) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Step 3
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Tell us more about how you feel
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Describe your symptoms in your own words. Include when they started or any specific details.
              </p>
            </div>

            <div>
              <textarea
                rows={5}
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                placeholder="Example: I have had a headache and fever for two days and feel very tired."
                className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-teal-700 focus:outline-hidden"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Tip: You can mention multiple symptoms together or use everyday descriptions like "head hurts" or "queasy".
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Duration */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Step 4
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                How long have you had these symptoms?
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Duration provides valuable context for understanding symptom patterns.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { label: "Less than 1 day", desc: "Started recently within the last 24 hours" },
                { label: "1–2 days", desc: "Ongoing for a couple of days" },
                { label: "3–7 days", desc: "Present for most of the past week" },
                { label: "More than 1 week", desc: "Persistent over an extended period" }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setDuration(item.label)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                    duration === item.label
                      ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold text-sm text-slate-900">{item.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Severity */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Step 5
              </div>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                How severe are your symptoms?
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Estimate how much your symptoms are affecting your regular activities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { label: "Mild", desc: "Noticeable, but does not interfere with daily routine" },
                { label: "Moderate", desc: "Uncomfortable and moderately disrupts activities" },
                { label: "Severe", desc: "Substantial distress; prevents normal daily functioning" }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSeverity(item.label)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition ${
                    severity === item.label
                      ? "border-teal-700 bg-teal-50/50 ring-1 ring-teal-700"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <span className="font-semibold text-sm text-slate-900">{item.label}</span>
                  <span className="text-xs text-slate-500 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Navigation Controls */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => {
                setValidationError("");
                setCurrentStep((prev) => prev + 1);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-teal-800"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={triggerAnalysis}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <Sparkles className="h-4 w-4" />
              <span>Analyze My Symptoms</span>
            </button>
          )}
        </div>
      </div>

      {/* Professional Analysis Modal / Loading Overlay (Section 6) */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <Stethoscope className="h-7 w-7 animate-pulse" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              Analyzing your symptoms...
            </h3>
            <p className="mt-2 text-sm text-teal-800 font-medium">
              {analysisPhase}
            </p>
            <div className="mt-6 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-700 animate-pulse rounded-full w-3/4" />
            </div>
            <p className="mt-4 text-[11px] text-slate-400">
              Reviewing health patterns and safety indicators
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
