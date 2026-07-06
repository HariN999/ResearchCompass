"use client";

import { useEffect, useState } from "react";

import { ResultsDashboard } from "../components/ResultsDashboard";
import { UploadSection } from "../components/UploadSection";
import { AgentWorkflow } from "../components/AgentWorkflow";
import { analyzeResearchPaper } from "../lib/api";
import type { AnalysisResult } from "../types/analysis";
import { Layers, FileCheck, Search, Code, HelpCircle, TrendingUp } from "lucide-react";

export default function Home(): JSX.Element {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFilename, setAnalyzedFilename] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme(): void {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  }

  async function handleAnalyze(file: File): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const analysis = await analyzeResearchPaper(file);
      setResult(analysis);
      setAnalyzedFilename(file.name);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing the paper.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 transition-all duration-150 dark:bg-gray-950 dark:text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white transition-all duration-150 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            ResearchCompass
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
                  <path
                    strokeLinecap="round"
                    strokeWidth={1.5}
                    d="M12 2.75v2M12 19.25v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2.75 12h2M19.25 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"
                  />
                </svg>
              ) : (
                <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20.25 14.15A7.5 7.5 0 0 1 9.85 3.75 8.25 8.25 0 1 0 20.25 14.15Z"
                  />
                </svg>
              )}
            </button>

            <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
              v1.1
            </span>
          </div>
        </div>
      </nav>

      {/* Main Body container */}
      <div className="mx-auto max-w-6xl px-6 py-6 md:py-12">
        
        {/* LANDING HERO VIEW */}
        {!result && !loading ? (
          <div className="space-y-16 py-6 md:py-12">
            <div className="grid gap-12 lg:grid-cols-[1fr_420px] items-start animate-fadeIn">
              
              {/* Left Column: Value Prop */}
              <div className="text-left space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-md px-3.5 py-1 text-[11px] font-semibold text-accent tracking-wider uppercase select-none">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                  Institutional Grade Protocol
                </span>
                
                <h1 className="text-4xl sm:text-5xl font-serif font-medium leading-[1.12] text-text-primary tracking-tight">
                  Evaluate Research Gaps & <br />
                  <span className="text-accent bg-gradient-to-r from-accent to-[#00A8FF] bg-clip-text text-transparent">
                    Accelerate Science
                  </span>
                </h1>
                
                <p className="text-sm leading-relaxed text-text-secondary max-w-xl font-sans">
                  Run your academic manuscripts through a structured six-stage analytical engine to audit methodology, uncover hidden gaps, and compute publication readiness.
                </p>

                {/* Interactive 6-Stage Timeline Node Layout */}
                <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6 pt-2 select-none">
                  {[
                    {
                      title: "Domain Classification & Subfield Categorization",
                      description: "Taxonomy sorting and subfield cluster mapping.",
                      icon: <Layers className="h-4 w-4" />
                    },
                    {
                      title: "Deep Methodology & Experimental Baseline Audits",
                      description: "Auditing datasets, baselines, and model assumptions.",
                      icon: <FileCheck className="h-4 w-4" />
                    },
                    {
                      title: "Exposing Unaddressed Weaknesses & Research Gaps",
                      description: "Extracting design limits and unaddressed constraints.",
                      icon: <Search className="h-4 w-4" />
                    },
                    {
                      title: "Generating Concrete Code & Implementation Recommendations",
                      description: "Structuring algorithmic optimizations and fixes.",
                      icon: <Code className="h-4 w-4" />
                    },
                    {
                      title: "Ph.D. Thesis Committee Viva Questions",
                      description: "Compiling defense-level reasoning questions.",
                      icon: <HelpCircle className="h-4 w-4" />
                    },
                    {
                      title: "Verified Publication Readiness Scorecard",
                      description: "Generating performance ratios and readiness metrics.",
                      icon: <TrendingUp className="h-4 w-4" />
                    }
                  ].map((stage, idx) => (
                    <div key={idx} className="relative group/node">
                      {/* Timeline Node dot */}
                      <span className="absolute -left-[31px] top-1 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[#0B0F19] border border-white/10 group-hover/node:border-accent/40 group-hover/node:bg-accent transition-all duration-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover/node:bg-[#0B0F19]" />
                      </span>
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 text-text-muted group-hover/node:text-accent transition-colors duration-300">
                          {stage.icon}
                        </span>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-semibold text-text-primary group-hover/node:text-accent transition-colors duration-300">
                            {stage.title}
                          </h4>
                          <p className="text-[11px] text-text-muted leading-normal">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-white/5 max-w-xl" />

                <p className="text-[11px] text-text-muted select-none flex items-center gap-1.5 pt-2 font-sans">
                  <svg className="h-3.5 w-3.5 text-accent/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Data is fully encrypted, sandboxed, and compliant with academic privacy standards.
                </p>
              </div>

              {/* Right Column: Upload Card */}
              <div className="rounded-2xl p-6 glass-card relative overflow-hidden group">
                <h3 className="text-sm font-bold text-text-primary text-left">
                  Start Review Process
                </h3>
                <p className="mt-1 text-xs text-text-secondary text-left">
                  Select your draft manuscript in PDF format.
                </p>
                <UploadSection onAnalyze={handleAnalyze} loading={loading} />
              </div>
            </div>

            {/* University Reputation Banner */}
            <div className="pt-10 border-t border-white/5 flex flex-col items-center justify-center gap-4 text-center select-none animate-fadeIn">
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
                Processing papers for researchers at global institutions
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-text-muted/40 font-sans">
                <span>Massachusetts Institute of Technology</span>
                <span>•</span>
                <span>Stanford University</span>
                <span>•</span>
                <span>University of Oxford</span>
                <span>•</span>
                <span>University of Cambridge</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* LOADING STATE FOCUS VIEW */}
        {loading && (
          <div className="max-w-4xl mx-auto py-12 text-center animate-fadeIn">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Agent Review In Progress
            </h2>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              An agent is actively evaluating your research paper structure...
            </p>
            <AgentWorkflow loading={loading} />
          </div>
        )}

        {/* ERROR STATE */}
        {error ? (
          <div className="max-w-2xl mx-auto mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/40">
            <p className="text-sm leading-6 text-red-600 dark:text-red-350">{error}</p>
          </div>
        ) : null}

        {/* RESULTS VIEW */}
        {result && !loading ? (
          <div className="animate-fadeIn mt-6 mb-24">
            {/* Header info */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Manuscript Analysis Report
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Comprehensive review outcomes for {analyzedFilename}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setResult(null); setError(null); }}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:text-gray-450 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                ← Analyze Another Paper
              </button>
            </div>
            <ResultsDashboard result={result} filename={analyzedFilename} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
