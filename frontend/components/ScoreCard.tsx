"use client";

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
      text: "text-emerald-600 dark:text-emerald-400",
      stroke: "stroke-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.12)] border-emerald-500/20 dark:border-emerald-500/10",
      label: "Strong",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      stroke: "stroke-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.12)] border-amber-500/20 dark:border-amber-500/10",
      label: "Moderate",
    };
  }

  return {
    text: "text-red-600 dark:text-red-400",
    stroke: "stroke-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    glow: "shadow-[0_0_25px_rgba(239,68,68,0.12)] border-red-500/20 dark:border-red-500/10",
    label: "Needs Work",
  };
}

export function ScoreCard({ score, justification }: ScoreCardProps): JSX.Element {
  const colors = getScoreColors(score);
  const normalizedScore = Math.max(0, Math.min(100, score));

  // Circumference of circle with r=36 is 2 * pi * 36 = 226.2
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * normalizedScore) / 100;

  return (
    <div className={`rounded-2xl border bg-gray-50/50 p-6 text-center backdrop-blur-sm transition-all duration-300 dark:bg-gray-900/20 ${colors.glow}`}>
      <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
        Publication Readiness
      </h3>

      {/* Radial Progress Circle with Center Score */}
      <div className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          {/* Background path */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-gray-200 fill-none dark:stroke-gray-800/80"
            strokeWidth="6"
          />
          {/* Active progress path */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Score indicator text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tracking-tight tabular-nums ${colors.text}`}>
            {score}
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest dark:text-gray-500">
            Percent
          </span>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex justify-center">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {/* Justification Text Block */}
      <div className="mt-5 border-t border-gray-150 pt-4 text-left dark:border-gray-800/60">
        <div className="flex items-center gap-2">
          <svg className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider dark:text-gray-500">
            Review Justification
          </h4>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {justification}
        </p>
      </div>
    </div>
  );
}
