"use client";

import { useEffect, useState } from "react";

import { ResultsDashboard } from "../components/ResultsDashboard";
import { UploadSection } from "../components/UploadSection";
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
      <nav className="border-b border-gray-200 bg-white transition-all duration-150 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
            ResearchGap <span className="text-indigo-500 dark:text-indigo-400">AI</span>
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
              v1.0
            </span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6">
        <section className="mx-auto max-w-2xl py-20 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Research analysis tool
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Find the gaps in your research paper
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-500 dark:text-gray-400">
            Upload a PDF and get a structured review of methodology, novelty, research gaps, implementation
            improvements, and publication readiness.
          </p>

          <UploadSection onAnalyze={handleAnalyze} loading={loading} />

          {error ? (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-left dark:border-red-900 dark:bg-red-950/40">
              <p className="text-sm leading-6 text-red-600 dark:text-red-300">{error}</p>
            </div>
          ) : null}
        </section>

        {result ? (
          <section className="mx-auto mb-24 max-w-4xl">
            <ResultsDashboard result={result} filename={analyzedFilename} />
          </section>
        ) : null}
      </div>
    </main>
  );
}
