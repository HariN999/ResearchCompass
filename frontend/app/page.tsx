"use client";

import { useEffect, useState } from "react";

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
          <div className="grid gap-12 md:grid-cols-[1fr_420px] items-center py-10 md:py-16 animate-fadeIn">
            
            {/* Left Column: Value Prop */}
            <div className="text-left space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                Academic Intelligence
              </span>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.15] text-gray-900 dark:text-white">
                Evaluate Research Gaps & <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500">
                  Accelerate Science
                </span>
              </h1>
              
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-xl">
                ResearchCompass runs your academic papers through a structured six-stage analysis workflow. Powered by <strong>Groq Cloud (llama-3.3-70b-versatile)</strong>, it critiques methodology baselines, identifies unaddressed limits, and computes publication readiness.
              </p>

              {/* Bullet Features list */}
              <div className="space-y-3 pt-2">
                {[
                  "Domain Classification & Subfield Categorization",
                  "Deep Methodology & Experimental baseline audits",
                  "Exposing unaddressed weaknesses and research gaps",
                  "Generating concrete code and implementation recommendations",
                  "Ph.D. Thesis committee viva questions",
                  "Verified publication readiness scorecard"
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Integration Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <span className="inline-flex items-center rounded-md border border-gray-250 bg-gray-50/50 px-2.5 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
                  Groq Cloud Layer
                </span>
                <span className="inline-flex items-center rounded-md border border-gray-255 bg-gray-50/50 px-2.5 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-400">
                  llama-3.3 deployment
                </span>
              </div>
            </div>

            {/* Right Column: Upload Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white text-left">
                Start Review Process
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-left">
                Select your draft manuscript in PDF format.
              </p>
              <UploadSection onAnalyze={handleAnalyze} loading={loading} />
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
