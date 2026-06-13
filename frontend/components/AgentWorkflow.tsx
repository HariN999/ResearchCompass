"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

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
  { time: "+1.5s", type: "agent", message: "Cognitive pipeline active. Reaching Azure AI Foundry (o4-mini)..." },
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
        const nextLog = mockLogs[currentLogIndex];
        setLogs((prev) => [...prev, nextLog]);
        currentLogIndex++;
      }
    }, 1000);

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
    <div className="mt-10 grid gap-8 md:grid-cols-[300px_1fr] text-left">
      
      {/* Visual Pipeline Checklist with Connecting Line */}
      <div className="relative rounded-2xl border border-white/10 bg-slate-900/30 p-6 shadow-xl backdrop-blur-md">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
          Agent Reasoning Pipeline
        </h4>
        
        {/* Timeline container */}
        <div className="relative mt-8 space-y-8 pl-8">
          
          {/* Vertical background connection line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-slate-800" />
          
          {/* Vertical animated active line */}
          <motion.div
            className="absolute left-[9px] top-2 w-[2px] bg-indigo-500 origin-top shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            initial={{ height: "0%" }}
            animate={{ height: `${(currentStep / (steps.length - 1)) * 85}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            return (
              <div
                key={step.id}
                className="relative flex items-center gap-4 transition-all duration-300"
              >
                {/* Node circle */}
                <div className="absolute left-[-31px] flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 z-10">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                    >
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  ) : isActive ? (
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500/30 opacity-75"></span>
                      <div className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500/20 border border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-800 border border-slate-700" />
                  )}
                </div>

                <span
                  className={`text-xs font-semibold transition-colors duration-300 ${
                    isCompleted
                      ? "text-slate-400"
                      : isActive
                      ? "text-white font-bold"
                      : "text-slate-600"
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
      <div className="flex flex-col h-[280px] rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl overflow-hidden font-mono text-[11px] leading-relaxed select-none backdrop-blur-md">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-900 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-500 text-[10px] font-bold">azure-foundry-o4-mini@agent</span>
          </div>
          <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
        </div>

        {/* Console Logs Area */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-2 pr-2 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {logs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              <span className="text-slate-600 select-none">{log.time}</span>
              <span className={log.type === "system" ? "text-indigo-400" : "text-emerald-400"}>
                [{log.type}]
              </span>
              <span className="text-slate-200">{log.message}</span>
            </motion.div>
          ))}
          {/* Active blinking prompt marker */}
          {logs.length < mockLogs.length && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-slate-600 select-none">+{(logs.length * 1.0 + 0.2).toFixed(1)}s</span>
              <span className="text-indigo-400 select-none">[active]</span>
              <span className="h-3.5 w-1.5 bg-indigo-500 animate-pulse" />
            </div>
          )}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
