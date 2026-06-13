interface ScoreCardProps {
  score: number;
  justification: string;
}

function getScoreClasses(score: number): { text: string; bar: string; border: string } {
  if (score >= 70) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bar: "bg-emerald-500",
      border: "border-emerald-500",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bar: "bg-amber-500",
      border: "border-amber-500",
    };
  }

  return {
    text: "text-red-600 dark:text-red-400",
    bar: "bg-red-500",
    border: "border-red-500",
  };
}

export function ScoreCard({ score, justification }: ScoreCardProps): JSX.Element {
  const scoreClasses = getScoreClasses(score);
  const normalizedScore = Math.max(0, Math.min(100, score));

  return (
    <section className="border-t border-gray-200 py-7 dark:border-gray-800 md:grid md:grid-cols-[220px_1fr] md:gap-8">
      <div className={`mb-4 border-l-2 pl-3 md:mb-0 ${scoreClasses.border}`}>
        <h2 className="text-sm font-medium text-gray-900 dark:text-white">Publication score</h2>
      </div>

      <div className="min-w-0">
        <div className="flex items-end gap-2">
          <span className={`text-5xl font-semibold tabular-nums tracking-tight ${scoreClasses.text}`}>{score}</span>
          <span className="pb-1 text-lg text-gray-400 dark:text-gray-500">/100</span>
        </div>

        <div className="mt-4 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-900">
          <div className={`h-1 rounded-full ${scoreClasses.bar}`} style={{ width: `${normalizedScore}%` }} />
        </div>

        <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">{justification}</p>
      </div>
    </section>
  );
}
