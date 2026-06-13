"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ResultsDashboard } from "../components/ResultsDashboard";
import { UploadSection } from "../components/UploadSection";
import { AgentWorkflow } from "../components/AgentWorkflow";
import { analyzeResearchPaper } from "../lib/api";
import type { AnalysisResult } from "../types/analysis";

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

  // Animation variants for Staggered Hero text
  const heroVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 overflow-hidden">
      
      {/* BACKGROUND GRAPHICS: Glow Orbs & Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[130px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
            ResearchCompass
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md p-2 text-slate-550 dark:text-slate-400 transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
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

            <span className="rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
              v1.2
            </span>
          </div>
        </div>
      </nav>

      {/* Main Body container */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-6 md:py-16">
        <AnimatePresence mode="wait">
          
          {/* LANDING HERO VIEW */}
          {!result && !loading ? (
            <motion.div
              key="hero"
              variants={heroVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-12 md:grid-cols-[1fr_420px] items-center py-6 md:py-12"
            >
              
              {/* Left Column: Value Prop */}
              <div className="text-left space-y-6">
                <motion.span
                  variants={itemVariants}
                  className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shadow-[0_1px_3px_rgba(99,102,241,0.02)] dark:shadow-[0_0_15px_rgba(99,102,241,0.06)]"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 dark:bg-indigo-400" />
                  Microsoft Agents League Entry
                </motion.span>
                
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.15] text-slate-900 dark:text-white"
                >
                  Critique Research & <br />
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-500 bg-clip-text text-transparent">
                    Accelerate Discovery
                  </span>
                </motion.h1>
                
                <motion.p
                  variants={itemVariants}
                  className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl"
                >
                  ResearchCompass runs academic manuscripts through a structured six-stage review workflow. Powered by <strong>Microsoft Azure AI Foundry (o4-mini)</strong>, the agent audits methodologies, exposes hidden research gaps, and calculates readiness scoring.
                </motion.p>

                {/* Bullet Features list */}
                <motion.div variants={itemVariants} className="space-y-3.5 pt-2">
                  {[
                    "CS Domain & subfield categorization",
                    "Deep methodology & experimental baseline audits",
                    "Exposing unaddressed weaknesses and research gaps",
                    "Generating concrete code & implementation improvements",
                    "Ph.D. Thesis committee defense viva questions",
                    "Publication readiness scorecard with detailed justification"
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </motion.div>

                {/* Integration Badges */}
                <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 pt-4">
                  <span className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Azure AI Foundry Layer
                  </span>
                  <span className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    o4-mini deployment
                  </span>
                </motion.div>
              </div>

              {/* Right Column: Upload Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/30 p-6 shadow-sm dark:shadow-xl backdrop-blur-xl transition-all hover:border-indigo-500/30"
              >
                <h3 className="text-sm font-bold text-slate-900 dark:text-white text-left">
                  Start Review Process
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 text-left">
                  Select your draft manuscript in PDF format.
                </p>
                <UploadSection onAnalyze={handleAnalyze} loading={loading} />
              </motion.div>

            </motion.div>
          ) : null}

          {/* LOADING STATE FOCUS VIEW */}
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto py-8 text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Review Agent Executing
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                An active reasoning trace is evaluating your PDF paper structure...
              </p>
              <AgentWorkflow loading={loading} />
            </motion.div>
          )}

          {/* ERROR STATE */}
          {error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto mt-6 rounded-lg border border-red-500/25 bg-red-50 dark:bg-red-950/20 p-4 text-left border-l-4 border-l-red-500 text-red-800 dark:text-red-400"
            >
              <p className="text-sm leading-6">{error}</p>
            </motion.div>
          ) : null}

          {/* RESULTS VIEW */}
          {result && !loading ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 mb-24"
            >
              {/* Header info */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/80">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Manuscript Analysis Report
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Comprehensive review outcomes for {analyzedFilename}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setResult(null); setError(null); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                >
                  ← Analyze Another Paper
                </button>
              </div>
              <ResultsDashboard result={result} filename={analyzedFilename} />
            </motion.div>
          ) : null}
          
        </AnimatePresence>
      </div>
    </main>
  );
}
