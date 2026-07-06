"use client";

import { useState } from "react";
import { ScoreCard } from "./ScoreCard";
import { SectionBlock } from "./SectionBlock";
import type { AnalysisResult } from "../types/analysis";

interface ResultsDashboardProps {
  result: AnalysisResult;
  filename: string;
}

type TabType = "overview" | "analysis" | "critique" | "next_steps";

export function ResultsDashboard({ result, filename }: ResultsDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const timestamp = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analysis", label: "Deep Analysis", icon: "🔬" },
    { id: "critique", label: "Critique & Gaps", icon: "⚠️" },
    { id: "next_steps", label: "Next Steps", icon: "🎓" },
  ];

  return (
    <div className="flex flex-col gap-8 md:flex-row items-start min-w-0">
      
      {/* LEFT SIDEBAR PANEL: Sticky Score & Meta */}
      <div className="w-full md:w-80 md:sticky md:top-6 shrink-0 space-y-6">
        
        {/* Score Card Widget */}
        <ScoreCard
          score={result.publication_readiness_score}
          justification={result.publication_readiness_justification}
        />

        {/* Paper details card */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-800/60 dark:bg-gray-900/20">
          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider dark:text-gray-500">
            Document details
          </h4>
          <div className="mt-4 space-y-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium">File name</span>
              <span className="truncate font-semibold text-gray-700 dark:text-gray-300 max-w-[140px]" title={filename}>
                {filename}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Analyzed on</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{timestamp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Review sections</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">13 categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CONTENT PANEL: Tabbed Navigation & Detailed Cards */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        
        {/* Tab Selection Row */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-350"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Panels */}
        <div className="transition-all duration-300 ease-in-out min-w-0">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              <SectionBlock
                title="Research Domain"
                content={result.research_domain}
                variant="default"
              />
              <SectionBlock
                title="Executive Summary"
                content={result.executive_summary}
                variant="default"
              />
              <SectionBlock
                title="Problem Statement"
                content={result.problem_statement}
                variant="default"
              />
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="space-y-6 animate-fadeIn">
              <SectionBlock
                title="Methodology"
                content={result.methodology}
                variant="default"
              />
              <SectionBlock
                title="Key Contributions"
                items={result.key_contributions}
                variant="success"
              />
              <SectionBlock
                title="Novelty Assessment"
                content={result.novelty_assessment}
                variant="default"
              />
            </div>
          )}

          {activeTab === "critique" && (
            <div className="space-y-6 animate-fadeIn">
              <SectionBlock
                title="Strengths"
                items={result.strengths}
                variant="success"
              />
              <SectionBlock
                title="Weaknesses"
                items={result.weaknesses}
                variant="warning"
              />
              <SectionBlock
                title="Research Gaps"
                items={result.research_gaps}
                variant="danger"
              />
            </div>
          )}

          {activeTab === "next_steps" && (
            <div className="space-y-6 animate-fadeIn">
              <SectionBlock
                title="Implementation Improvements"
                items={result.implementation_improvements}
                variant="default"
              />
              <SectionBlock
                title="Future Work"
                items={result.future_work}
                variant="success"
              />
              <SectionBlock
                title="Viva Questions"
                items={result.viva_questions}
                variant="warning"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
