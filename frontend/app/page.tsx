"use client";

import { useEffect, useState } from "react";

import { ResultsDashboard } from "../components/ResultsDashboard";
import { UploadSection } from "../components/UploadSection";
import { AgentWorkflow } from "../components/AgentWorkflow";
import { analyzeResearchPaper, compareResearchPapers, generateLiteratureReview } from "../lib/api";
import type { AnalysisResult, ComparisonResponse, LiteratureReviewResponse } from "../types/analysis";

interface AnalyzedPaper {
  name: string;
  result: AnalysisResult;
}

export default function Home(): JSX.Element {
  const [papers, setPapers] = useState<AnalyzedPaper[]>([]);
  const [activePaperIndex, setActivePaperIndex] = useState<number>(0);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Contextual comparative actions state
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);
  
  const [litReview, setLitReview] = useState<LiteratureReviewResponse | null>(null);
  const [loadingLitReview, setLoadingLitReview] = useState<boolean>(false);

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

  async function handleAnalyze(files: File[]): Promise<void> {
    setLoading(true);
    setError(null);
    setPapers([]);
    setComparison(null);
    setLitReview(null);

    const completed: AnalyzedPaper[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingStep(`Analyzing paper ${i + 1} of ${files.length}: ${file.name}`);
        const analysis = await analyzeResearchPaper(file);
        completed.push({
          name: file.name,
          result: analysis,
        });
      }
      setPapers(completed);
      setActivePaperIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing the papers.");
      setPapers([]);
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  }

  async function handleCompare(): Promise<void> {
    const docIds = papers
      .map((p) => p.result.metadata?.document_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (docIds.length < 2) {
      setError("At least two successfully analyzed papers are required for comparison.");
      return;
    }

    setLoadingComparison(true);
    setComparison(null);
    setError(null);

    try {
      const res = await compareResearchPapers(docIds);
      setComparison(res);
      // Scroll to comparison section
      setTimeout(() => {
        document.getElementById("comparison-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to compare the research papers.");
    } finally {
      setLoadingComparison(false);
    }
  }

  async function handleLitReview(): Promise<void> {
    const docIds = papers
      .map((p) => p.result.metadata?.document_id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    if (docIds.length < 2) {
      setError("At least two successfully analyzed papers are required to generate a literature review.");
      return;
    }

    setLoadingLitReview(true);
    setLitReview(null);
    setError(null);

    try {
      const res = await generateLiteratureReview(docIds);
      setLitReview(res);
      // Scroll to lit review section
      setTimeout(() => {
        document.getElementById("lit-review-results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate the literature review.");
    } finally {
      setLoadingLitReview(false);
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

          <div className="flex items-center gap-3">
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

            <span className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500 font-medium">
              v1.0
            </span>
          </div>
        </div>
      </nav>

      {/* Main Body container */}
      <div className="mx-auto max-w-6xl px-6 py-6 md:py-12">
        {/* LANDING HERO VIEW */}
        {papers.length === 0 && !loading ? (
          <div className="grid gap-12 md:grid-cols-[1fr_420px] items-center py-10 md:py-16 animate-fadeIn">
            {/* Left Column: Value Prop */}
            <div className="text-left space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
                Focused AI Research Analyzer
              </span>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.15] text-gray-900 dark:text-white">
                Understand Academic <br />
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-500">
                  Papers in Seconds
                </span>
              </h1>

              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 max-w-xl">
                Upload one or multiple research papers in PDF format. We run them through our page and section-aware retrieval pipeline to extract methodology baselines, technical strengths, core research gaps, and defense-ready viva questions without compromising token usage or data privacy.
              </p>

              {/* Bullet Features list */}
              <div className="space-y-3 pt-2">
                {[
                  "Intelligent section-aware semantic retrieval context",
                  "Deep baselines, strengths, and weaknesses audit",
                  "Grounded critiques with section and page citations",
                  "No persistent global library exposure (session-isolated memory)",
                  "Compare Papers and Generate Literature Reviews on demand"
                ].map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Upload Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md dark:border-gray-800 dark:bg-gray-950/40">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white text-left">
                Start Review Process
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-left">
                Select one or more manuscripts in PDF format.
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
            <p className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
              {loadingStep || "Analyzing research paper structures..."}
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
        {papers.length > 0 && !loading ? (
          <div className="animate-fadeIn mt-6 mb-24 space-y-12">
            {/* Header info & Upload Reset */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Manuscript Analysis Report
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Analysis completed for {papers.length} paper{papers.length > 1 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPapers([]);
                  setComparison(null);
                  setLitReview(null);
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all duration-150 hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                ← Analyze Another Paper
              </button>
            </div>

            {/* Paper Selection Buttons for Multi-PDF flow */}
            {papers.length > 1 && (
              <div className="flex flex-wrap gap-2 items-center border-b border-gray-200 dark:border-gray-800 pb-4">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-2">Select Active Paper:</span>
                {papers.map((paper, idx) => {
                  const isActive = idx === activePaperIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActivePaperIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {paper.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Results Dashboard for Active Paper */}
            <div>
              <ResultsDashboard
                result={papers[activePaperIndex].result}
                filename={papers[activePaperIndex].name}
              />
            </div>

            {/* Contextual Multi-Document Comparison & Review Action Area */}
            {papers.length > 1 && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-10 mt-12 space-y-8">
                <div className="text-center space-y-2">
                  <h3 className="text-md font-bold text-gray-900 dark:text-white">Comparative AI Synthesis</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Evaluate relationships, overlaps, and reviews across the analyzed papers.</p>
                  
                  <div className="flex gap-4 justify-center pt-3">
                    <button
                      onClick={handleCompare}
                      disabled={loadingComparison || loadingLitReview}
                      className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-850 transition disabled:opacity-50"
                    >
                      {loadingComparison ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-gray-500 border-t-transparent" />
                      ) : null}
                      {loadingComparison ? "Comparing Papers..." : "Compare Papers"}
                    </button>

                    <button
                      onClick={handleLitReview}
                      disabled={loadingComparison || loadingLitReview}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                    >
                      {loadingLitReview ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      ) : null}
                      {loadingLitReview ? "Generating Review..." : "Generate Literature Review"}
                    </button>
                  </div>
                </div>

                {/* Compare Results display */}
                {comparison && (
                  <div id="comparison-results" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/40 space-y-6 animate-fadeIn">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Synthesis result</span>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">Research Papers Comparison</h4>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        { title: "Executive Comparison", content: comparison.executive_comparison },
                        { title: "Methodology Comparison", content: comparison.methodology_comparison },
                        { title: "Dataset & Benchmark Comparison", content: comparison.dataset_comparison },
                        { title: "Similarities", content: comparison.similarities },
                        { title: "Differences", content: comparison.differences },
                        { title: "Technical Strengths", content: comparison.strength_comparison },
                        { title: "Technical Weaknesses", content: comparison.weakness_comparison },
                        { title: "Recommendation", content: comparison.overall_recommendation },
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                          <h5 className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</h5>
                          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lit Review Results display */}
                {litReview && (
                  <div id="lit-review-results" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/40 space-y-6 animate-fadeIn">
                    <div className="border-b border-gray-200 dark:border-gray-800 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Literature review result</span>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">Synthesized Literature Review</h4>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {[
                        { title: "Overview", content: litReview.overview },
                        { title: "Major Themes", content: litReview.major_themes },
                        { title: "Methodology Trends", content: litReview.methodology_trends },
                        { title: "Strengths across Literature", content: litReview.strengths },
                        { title: "Limitations across Literature", content: litReview.limitations },
                        { title: "Research Trends", content: litReview.research_trends },
                        { title: "Open Challenges", content: litReview.open_challenges },
                        { title: "Future Directions", content: litReview.future_directions },
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/20">
                          <h5 className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</h5>
                          <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{item.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-gray-250 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/20 space-y-2 mt-4">
                      <h5 className="text-xs font-semibold text-gray-900 dark:text-white">Formal Related Work Synthesis</h5>
                      <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line leading-6">
                        {litReview.generated_literature_review}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
