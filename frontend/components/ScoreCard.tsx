"use client";

interface ScoreCardProps {
  score: number;
  justification: string;
}

function getScoreColors(score: number): { text: string; stroke: string; bg: string; badge: string; label: string } {
  if (score >= 70) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      stroke: "stroke-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      label: "Strong",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      stroke: "stroke-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      label: "Moderate",
    };
  }

  return {
    text: "text-red-600 dark:text-red-400",
    stroke: "stroke-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
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
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center backdrop-blur-sm transition-all duration-300 dark:border-gray-800/60 dark:bg-gray-900/20 hover:shadow-md">
      <h3 className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
        Publication Readiness
      </h3>

      {/* Radial Progress Circle */}
      <div className="relative mx-auto mt-6 flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-gray-200 fill-none dark:stroke-gray-800/80"
            strokeWidth="6"
          />
          {/* Active progress circle */}
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

        {/* Score text in center */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tracking-tight tabular-nums ${colors.text}`}>
            {score}
          </span>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest dark:text-gray-500">
            Score
          </span>
        </div>
      </div>

      {/* Badge label */}
      <div className="mt-4 flex justify-center">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}>
          {colors.label}
        </span>
      </div>

      {/* Justification Text */}
      <div className="mt-5 border-t border-gray-100 pt-4 text-left dark:border-gray-800/60">
        <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wider dark:text-gray-500">
          Justification
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {justification}
        </p>
      </div>
    </div>
  );
}
