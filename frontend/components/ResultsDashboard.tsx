import { ScoreCard } from "./ScoreCard";
import { SectionBlock } from "./SectionBlock";
import type { AnalysisResult } from "../types/analysis";

interface ResultsDashboardProps {
  result: AnalysisResult;
  filename: string;
}

export function ResultsDashboard({ result, filename }: ResultsDashboardProps): JSX.Element {
  const timestamp = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all duration-150 dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-2 pb-6 text-xs text-gray-400 dark:text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>13 sections</span>
          <span>·</span>
          <span className="max-w-xs truncate">{filename}</span>
        </div>
        <span>{timestamp}</span>
      </div>

      <SectionBlock title="Research Domain" content={result.research_domain} />
      <SectionBlock title="Executive Summary" content={result.executive_summary} />
      <SectionBlock title="Problem Statement" content={result.problem_statement} />
      <SectionBlock title="Methodology" content={result.methodology} />
      <SectionBlock title="Key Contributions" items={result.key_contributions} variant="success" />
      <SectionBlock title="Strengths" items={result.strengths} variant="success" />
      <SectionBlock title="Weaknesses" items={result.weaknesses} variant="warning" />
      <SectionBlock title="Research Gaps" items={result.research_gaps} variant="danger" />
      <SectionBlock title="Novelty Assessment" content={result.novelty_assessment} />
      <SectionBlock title="Implementation Improvements" items={result.implementation_improvements} />
      <SectionBlock title="Future Work" items={result.future_work} variant="success" />
      <SectionBlock title="Viva Questions" items={result.viva_questions} variant="warning" />
      <ScoreCard score={result.publication_readiness_score} justification={result.publication_readiness_justification} />
    </div>
  );
}
