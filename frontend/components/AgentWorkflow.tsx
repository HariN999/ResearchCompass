"use client";

import { useEffect, useState } from "react";

interface AgentWorkflowProps {
  loading: boolean;
}

const steps = [
  { id: "domain", label: "Domain & Subfield Analysis" },
  { id: "methodology", label: "Methodology & Architecture Evaluation" },
  { id: "gaps", label: "Research Gap & Novelty Detection" },
  { id: "improvements", label: "Code-level & Implementation Recommendations" },
  { id: "publication", label: "Thesis Defense & Publication Readiness Scoring" },
];

export function AgentWorkflow({ loading }: AgentWorkflowProps): JSX.Element | null {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50/50 p-6 text-left backdrop-blur-sm transition-all duration-300 dark:border-gray-800/50 dark:bg-gray-900/30">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/60">
        <div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-indigo-500 dark:text-indigo-400">
            Reasoning Agent Pipeline
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Azure AI Foundry (o4-mini) is executing multi-step reasoning steps...
          </p>
        </div>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500/25 border-t-indigo-500" aria-hidden="true" />
      </div>

      <div className="mt-6 space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isActive ? "scale-[1.01]" : ""
              }`}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                {isCompleted ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isActive ? (
                  <div className="relative flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75 dark:bg-indigo-600"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                  </div>
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                )}
              </div>

              <span
                className={`text-xs font-medium transition-colors duration-300 ${
                  isCompleted
                    ? "text-gray-500 dark:text-gray-400"
                    : isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
