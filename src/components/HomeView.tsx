import React from "react";
import {
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  AlertCircle,
  HelpCircle,
  Clock,
  HeartPulse,
  Lock
} from "lucide-react";

interface HomeViewProps {
  onStart: () => void;
  onHowItWorks: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onStart, onHowItWorks }) => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl leading-tight">
          Understand what your symptoms may be telling you.
        </h1>
        <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Describe your symptoms and receive an easy-to-understand assessment of relevant symptom patterns and guidance.
        </p>

        {/* Primary and Secondary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-teal-800"
          >
            <span>Start Symptom Check</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onHowItWorks}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <span>How It Works</span>
          </button>
        </div>

        {/* Small, professionally designed entry disclaimer */}
        <div className="mx-auto mt-7 max-w-2xl rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-600 text-center leading-relaxed">
          <span className="font-medium text-slate-800">Notice:</span> This tool provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment.
        </div>
      </div>

      {/* How It Works 3-Step Guided Section */}
      <section id="how-it-works" className="mt-20 border-t border-slate-200 pt-16">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            How the Symptom Check Works
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A simple, guided 3-step process designed to help you organize information before seeing a doctor.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-semibold text-sm">
              1
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Describe Your Symptoms
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Tell us what you are experiencing in your own words, or choose from our list of common symptoms.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-semibold text-sm">
              2
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Pattern Assessment
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              The system compares your symptoms against recognized health patterns and checks for critical warning signs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-semibold text-sm">
              3
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Clear, Actionable Guidance
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Review understandable insights about relevant patterns, safety considerations, and practical next steps.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Product Pillars */}
      <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-2xs">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="pr-4">
            <div className="flex items-center gap-2.5 text-teal-700 font-semibold text-sm">
              <ClipboardList className="h-5 w-5" />
              <span>Personalized Insights</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Tailored pattern observations based on your specific combination of symptoms, duration, and age group.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:px-6">
            <div className="flex items-center gap-2.5 text-teal-700 font-semibold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>Safety Prioritized</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Highlights acute red-flag warning signs promptly to help you know when urgent medical evaluation is required.
            </p>
          </div>

          <div className="pt-6 md:pt-0 md:pl-6">
            <div className="flex items-center gap-2.5 text-teal-700 font-semibold text-sm">
              <Lock className="h-5 w-5" />
              <span>Private & Anonymous</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              No account creation or personal identification needed. Your answers remain strictly confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <div className="mt-16 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center sm:p-10">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Ready to check your symptoms?
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Takes only 1 to 2 minutes. Get clear, structured information before your next doctor's appointment.
        </p>
        <button
          onClick={onStart}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-800 transition"
        >
          <span>Start Symptom Check</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
