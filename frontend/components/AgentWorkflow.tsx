"use client";

import { useEffect, useState, useRef } from "react";

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

const mockLogs = [
  { time: "+0.2s", type: "system", message: "Opening PDF stream inside PyMuPDF memory buffer..." },
  { time: "+0.8s", type: "system", message: "Extracted text payload: 12,000 characters from front matter/conclusions." },
  { time: "+1.5s", type: "agent", message: "Cognitive pipeline active. Reaching Groq Cloud (llama-3.3-70b)..." },
  { time: "+2.4s", type: "agent", message: "Domain Classification: Scanning taxonomy databases..." },
  { time: "+3.8s", type: "agent", message: "Methodology: Analyzing training objectives, datasets, and benchmark baselines..." },
  { time: "+5.1s", type: "agent", message: "Novelty Assessment: Checking for incremental extensions vs. structural contributions..." },
  { time: "+6.5s", type: "agent", message: "Gap Discovery: Exposing unaddressed constraints and experimental limitations..." },
  { time: "+7.9s", type: "agent", message: "Code & Implementation: Generating concrete hardware and scaling recommendations..." },
  { time: "+9.2s", type: "agent", message: "Viva Generation: Compiling doctoral-level defense questions..." },
  { time: "+10.5s", type: "agent", message: "Scoring: Normalizing publication readiness score and compiling final justification report..." },
  { time: "+11.8s", type: "system", message: "Structuring analysis payload into verified JSON schema..." }
];

export function AgentWorkflow({ loading }: AgentWorkflowProps): JSX.Element | null {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<typeof mockLogs>([]);
  const consoleEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading) {
      setCurrentStep(0);
      setLogs([]);
      return;
    }

    // Cycle through steps
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    // Stream logs
    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < mockLogs.length) {
        setLogs((prev) => [...prev, mockLogs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 1100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(logInterval);
    };
  }, [loading]);

  // Scroll logs to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  if (!loading) return null;

  return (
    <div className="mt-10 grid gap-6 md:grid-cols-[280px_1fr] text-left">
      
      {/* Visual Pipeline Checklist */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
          Agent Reasoning Pipeline
        </h4>
        <div className="mt-6 space-y-4">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive ? "scale-[1.02]" : ""
                }`}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {isCompleted ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
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
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isCompleted
                      ? "text-gray-400 dark:text-gray-500"
                      : isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-350 dark:text-gray-700"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal logs console */}
      <div className="flex flex-col h-[230px] rounded-2xl border border-gray-800 bg-gray-950 p-5 shadow-lg overflow-hidden font-mono text-[11px] leading-relaxed select-none">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-900 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-gray-500 text-[10px] font-bold">groq-llama-3.3@agent</span>
          </div>
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
        </div>

        {/* Console Logs Area */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2 text-gray-300 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-600 select-none">{log.time}</span>
              <span className={log.type === "system" ? "text-indigo-400" : "text-emerald-400"}>
                [{log.type}]
              </span>
              <span className="text-gray-200">{log.message}</span>
            </div>
          ))}
          {/* Active blinking prompt marker */}
          {logs.length < mockLogs.length && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-gray-600 select-none">+{(logs.length * 1.1 + 0.2).toFixed(1)}s</span>
              <span className="text-indigo-500 select-none">[active]</span>
              <span className="h-3 w-1.5 bg-indigo-500 animate-pulse" />
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
