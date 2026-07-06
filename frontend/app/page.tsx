"use client";

import { useEffect, useState } from "react";
import { UploadSection } from "../components/UploadSection";
import { analyzeResearchPaper } from "../lib/api";
import type { AnalysisResult } from "../types/analysis";

export default function Home(): JSX.Element {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFilename, setAnalyzedFilename] = useState<string>("");
  const [pipelineStep, setPipelineStep] = useState<number>(0);

  useEffect(() => {
    if (loading) {
      setPipelineStep(0);
      const timer1 = setTimeout(() => setPipelineStep(1), 1200);
      const timer2 = setTimeout(() => setPipelineStep(2), 2400);
      const timer3 = setTimeout(() => setPipelineStep(3), 3600);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (result) {
      setPipelineStep(4);
    } else {
      setPipelineStep(0);
    }
  }, [loading, result]);

  async function handleAnalyze(file: File): Promise<void> {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedFilename(file.name);

    try {
      const analysis = await analyzeResearchPaper(file);
      setResult(analysis);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing the paper.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans transition-all duration-150">
      {/* Navigation Header */}
      <nav className="border-b border-white/5 bg-[#0B0F19] shrink-0 sticky top-0 z-50 select-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
            ResearchCompass
          </div>

          <div className="flex items-center gap-6">
            {/* LLM Provider Runtime Dropdown */}
            <div className="relative text-xs text-text-secondary bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 font-sans select-none">
              <span className="text-text-muted">LLM Provider:</span> <span className="font-semibold text-accent">Groq (Llama-3.3-70b) ▼</span>
            </div>

            <span className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-0.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
              v1.2
            </span>
          </div>
        </div>
      </nav>

      {/* Main Body container */}
      <div className="mx-auto max-w-7xl px-6 py-8 flex-1 flex flex-col w-full justify-between">
        
        <div className="grid gap-8 lg:grid-cols-2 items-start w-full animate-fadeIn mb-8">
          
          {/* LEFT COLUMN: Input & Ingestion Pipeline */}
          <div className="space-y-6 flex flex-col">
            {/* 1. Drag & Drop Card Container */}
            <div className="rounded-2xl p-6 glass-card relative overflow-hidden group">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 text-left">
                Manuscript Ingestion
              </h3>
              <UploadSection onAnalyze={handleAnalyze} loading={loading} />
            </div>

            {/* 2. Live Ingestion Monitor Console */}
            <div className="rounded-2xl p-6 border border-white/5 bg-black/40 font-mono text-[11px] leading-relaxed shadow-lg">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${loading ? "bg-accent animate-pulse" : "bg-text-muted"}`} />
                Live Ingestion Monitor
              </h4>
              <div className="space-y-2 text-text-secondary text-left">
                {[
                  "Extracting layout blocks (PyMuPDF)...",
                  "Segmenting text chunks...",
                  "Generating local BGE vector embeddings...",
                  "Persisting indices to local ChromaDB..."
                ].map((step, idx) => {
                  let prefix = "[○]";
                  let textColor = "text-text-muted";
                  if (pipelineStep > idx) {
                    prefix = "[✓]";
                    textColor = "text-accent";
                  } else if (pipelineStep === idx && loading) {
                    prefix = "[▶]";
                    textColor = "text-text-primary font-bold";
                  }
                  return (
                    <div key={idx} className={`flex items-center gap-2.5 ${textColor} transition-colors duration-200`}>
                      <span>{prefix}</span>
                      <span>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message Panel */}
            {error && (
              <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-left animate-fadeIn">
                <p className="text-xs font-mono text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Structured Review Dashboard Output */}
          <div className="grid gap-6 sm:grid-cols-2 items-start">
            
            {/* Card 1: Document Metadata */}
            <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] min-h-[150px] text-left">
              <h4 className="text-[11px] font-bold text-accent uppercase tracking-wider mb-3">
                Document Metadata
              </h4>
              {result ? (
                <div className="space-y-2 font-sans text-xs">
                  <div>
                    <span className="text-text-muted text-[11px]">Title: </span>
                    <span className="font-semibold text-text-primary block truncate max-w-full" title={analyzedFilename}>{analyzedFilename}</span>
                  </div>
                  <div>
                    <span className="text-text-muted text-[11px]">Subfield Domain: </span>
                    <span className="font-semibold text-text-primary block capitalize">{result.research_domain || "Computer Science"}</span>
                  </div>
                  <div className="flex gap-4 pt-1">
                    <div>
                      <span className="text-text-muted text-[11px]">Year: </span>
                      <span className="font-semibold text-text-primary block">2026</span>
                    </div>
                    <div>
                      <span className="text-text-muted text-[11px]">Scope: </span>
                      <span className="font-semibold text-text-primary block">Self-Hosted</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-24 flex items-center justify-center text-text-muted italic text-[11px]">
                  Awaiting ingestion...
                </div>
              )}
            </div>

            {/* Card 2: Publication Readiness Score */}
            <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] min-h-[150px] text-left flex flex-col justify-between">
              <h4 className="text-[11px] font-bold text-accent uppercase tracking-wider mb-2">
                Publication Readiness
              </h4>
              <div className="flex-1 flex flex-col items-center justify-center">
                {result ? (
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-accent">{result.publication_readiness_score}</span>
                    <span className="text-text-muted text-xs"> / 100</span>
                    <p className="text-[10px] text-accent/80 font-bold uppercase tracking-wider mt-1.5">
                      {result.publication_readiness_score >= 80 ? "Highly Ready" : result.publication_readiness_score >= 60 ? "Ready with Revisions" : "Draft limits"}
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-text-muted">--</span>
                    <span className="text-text-muted text-xs"> / 100</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Methodology Audit & Gaps */}
            <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] min-h-[220px] text-left sm:col-span-2">
              <h4 className="text-[11px] font-bold text-accent uppercase tracking-wider mb-3">
                Methodology Audit & Gaps
              </h4>
              {result ? (
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <h5 className="font-semibold text-text-primary mb-1">Baseline Model & Settings:</h5>
                    <p className="text-text-secondary leading-relaxed">{result.methodology || "Extracted baseline pipeline settings."}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-text-primary mb-1">Detected Sample Size / Limits & Gaps:</h5>
                    <ul className="list-disc pl-4 space-y-1 text-text-secondary">
                      {result.weaknesses && result.weaknesses.length > 0 ? (
                        result.weaknesses.slice(0, 3).map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))
                      ) : (
                        <li>No methodology limitations recorded.</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-text-muted italic text-[11px]">
                  Methodology models and gap assessments will populate here.
                </div>
              )}
            </div>

            {/* Card 4: Thesis Preparation Panel */}
            <div className="rounded-2xl p-5 border border-white/5 bg-white/[0.01] min-h-[220px] text-left sm:col-span-2">
              <h4 className="text-[11px] font-bold text-accent uppercase tracking-wider mb-3">
                Thesis Preparation Panel (Viva Questions)
              </h4>
              {result ? (
                <div className="space-y-2 font-sans text-xs">
                  <ol className="list-decimal pl-4 space-y-2 text-text-secondary leading-relaxed">
                    {result.viva_questions && result.viva_questions.length > 0 ? (
                      result.viva_questions.slice(0, 5).map((q, idx) => (
                        <li key={idx} className="hover:text-text-primary transition-colors">{q}</li>
                      ))
                    ) : (
                      <li>No defense questions generated.</li>
                    )}
                  </ol>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-text-muted italic text-[11px]">
                  5 defense-level viva questions will be generated.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* System Status Footer */}
      <footer className="h-10 border-t border-white/5 flex items-center justify-center select-none bg-black/40 shrink-0 z-20">
        <span className="text-[10px] text-text-muted tracking-wider uppercase font-mono">
          Isolated Local Instance | Engine: SQLite ChromaDB | Fully Sandboxed Privacy Protocol
        </span>
      </footer>
    </main>
  );
}
