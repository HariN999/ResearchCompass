"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreCardProps {
  score: number;
  justification: string;
}

interface ColorSet {
  text: string;
  stroke: string;
  bg: string;
  badge: string;
  glow: string;
  label: string;
}

function getScoreColors(score: number): ColorSet {
  if (score >= 70) {
    return {
      text: "text-emerald-600 dark:text-emerald-500",
      stroke: "stroke-emerald-500",
      bg: "bg-emerald-500/10",
      badge: "bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
      glow: "shadow-[0_4px_20px_rgba(16,185,129,0.05)] dark:shadow-[0_0_30px_rgba(16,185,129,0.12)] border-emerald-500/20 dark:border-emerald-500/20",
      label: "Strong",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-600 dark:text-amber-500",
      stroke: "stroke-amber-500",
      bg: "bg-amber-500/10",
      badge: "bg-amber-50/80 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
      glow: "shadow-[0_4px_20px_rgba(245,158,11,0.05)] dark:shadow-[0_0_30px_rgba(245,158,11,0.12)] border-amber-500/20 dark:border-amber-500/20",
      label: "Moderate",
    };
  }

  return {
    text: "text-red-600 dark:text-red-500",
    stroke: "stroke-red-500",
    bg: "bg-red-500/10",
    badge: "bg-red-50/80 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
    glow: "shadow-[0_4px_20px_rgba(239,68,68,0.05)] dark:shadow-[0_0_30px_rgba(239,68,68,0.12)] border-red-500/20 dark:border-red-500/20",
    label: "Needs Work",
  };
}

export function ScoreCard({ score, justification }: ScoreCardProps): JSX.Element {
  const colors = getScoreColors(score);
  const normalizedScore = Math.max(0, Math.min(100, score));
  const [displayScore, setDisplayScore] = useState(0);

  // Circumference of circle with r=36 is 2 * pi * 36 = 226.2
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * normalizedScore) / 100;

  useEffect(() => {
    let start = 0;
    const end = normalizedScore;
    if (end === 0) {
      setDisplayScore(0);
      return;
    }

    const duration = 1200; // 1.2s to match the circle animation
    const stepTime = Math.max(Math.floor(duration / end), 10);
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [normalizedScore]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`rounded-2xl border bg-white dark:bg-slate-900/40 p-4 sm:p-6 text-center backdrop-blur-xl transition-all duration-300 ${colors.glow}`}
    >
      <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        Publication Readiness
      </h3>

      {/* Radial Progress Circle with Center Score */}
      <div className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800 fill-none"
            strokeWidth="5"
          />
          {/* Active progress circle using motion.circle */}
          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            className={`fill-none ${colors.stroke}`}
            strokeWidth="5.5"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        {/* Score indicator text */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-3xl font-extrabold tracking-tight tabular-nums ${colors.text}`}
          >
            {displayScore}
          </motion.span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Percent
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex justify-center">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {/* Justification Text Block */}
      <div className="mt-5 border-t border-slate-200 dark:border-slate-800/80 pt-4 text-left">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-slate-450 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
            Reviewer Report
          </h4>
        </div>
        <p className="mt-2.5 text-xs leading-relaxed text-slate-650 dark:text-slate-400">
          {justification}
        </p>
      </div>
    </motion.div>
  );
}
