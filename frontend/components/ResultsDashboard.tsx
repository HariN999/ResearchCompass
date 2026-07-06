"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Cpu, AlertTriangle, GraduationCap, FileText, Calendar, Layers } from "lucide-react";

import { ScoreCard } from "./ScoreCard";
import { SectionBlock } from "./SectionBlock";
import type { AnalysisResponse } from "../types/analysis";

interface ResultsDashboardProps {
  result: AnalysisResponse;
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

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "analysis" as const, label: "Deep Analysis", icon: Cpu },
    { id: "critique" as const, label: "Critique & Gaps", icon: AlertTriangle },
    { id: "next_steps" as const, label: "Next Steps", icon: GraduationCap },
  ];

  // Motion animation parameters for staggered entries
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring" as const, stiffness: 100, damping: 15 } 
    },
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row items-start min-w-0">
      
      {/* LEFT SIDEBAR PANEL: Sticky Score & Meta */}
      <div className="w-full lg:w-80 lg:sticky lg:top-6 shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:space-y-0">
        
        {/* Score Card Widget */}
        <ScoreCard
          score={result.publication_readiness_score}
          justification={result.publication_readiness_justification}
        />

        {/* Paper details card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/30 p-4 sm:p-6 shadow-sm dark:shadow-xl backdrop-blur-xl"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800/80">
            <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Document details
            </h4>
          </div>
          
          <div className="mt-4 space-y-3.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                <FileText className="h-3 w-3" /> File
              </span>
              <span className="truncate font-semibold text-slate-700 dark:text-slate-300 max-w-[140px]" title={filename}>
                {filename}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                <Calendar className="h-3 w-3" /> Date
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{timestamp}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 font-medium">
                <Layers className="h-3 w-3" /> Review
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">13 categories</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* RIGHT CONTENT PANEL: Tabbed Navigation & Detailed Cards */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        
        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-3 sm:px-5 sm:py-4 text-[10px] sm:text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_1px_4px_rgba(99,102,241,0.2)] dark:shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Panels with Staggered Motion */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {activeTab === "overview" && (
                <>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Research Domain"
                      content={result.research_domain}
                      variant="default"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Executive Summary"
                      content={result.executive_summary}
                      variant="default"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Problem Statement"
                      content={result.problem_statement}
                      variant="default"
                    />
                  </motion.div>
                </>
              )}

              {activeTab === "analysis" && (
                <>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Methodology"
                      content={result.methodology}
                      variant="default"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Key Contributions"
                      items={result.key_contributions}
                      variant="success"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Novelty Assessment"
                      content={result.novelty_assessment}
                      variant="default"
                    />
                  </motion.div>
                </>
              )}

              {activeTab === "critique" && (
                <>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Strengths"
                      items={result.strengths}
                      variant="success"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Weaknesses"
                      items={result.weaknesses}
                      variant="warning"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Research Gaps"
                      items={result.research_gaps}
                      variant="danger"
                    />
                  </motion.div>
                </>
              )}

              {activeTab === "next_steps" && (
                <>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Implementation Improvements"
                      items={result.implementation_improvements}
                      variant="default"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Future Work"
                      items={result.future_work}
                      variant="success"
                    />
                  </motion.div>
                  <motion.div variants={cardVariants}>
                    <SectionBlock
                      title="Viva Questions"
                      items={result.viva_questions}
                      variant="warning"
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
