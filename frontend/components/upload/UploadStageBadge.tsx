import * as React from "react";
import { cn } from "../../lib/utils";
import type { UploadStage } from "./queue-types";
import { STAGE_LABELS } from "./queue-types";

export interface UploadStageBadgeProps {
  stage: UploadStage;
  className?: string;
}

export function UploadStageBadge({ stage, className }: UploadStageBadgeProps): JSX.Element {
  const styles: Record<string, string> = {
    queued: "bg-surface-hover text-text-secondary border-border",
    uploading: "bg-primary/10 text-primary border-primary/20",
    validating: "bg-primary/10 text-primary border-primary/20",
    extracting: "bg-warning/10 text-warning border-warning/20",
    chunking: "bg-warning/10 text-warning border-warning/20",
    embedding: "bg-warning/10 text-warning border-warning/20",
    indexing: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-success/10 text-success border-success/20",
    failed: "bg-danger/10 text-danger border-danger/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-caption font-semibold select-none",
        styles[stage] ?? styles.queued,
        className
      )}
      role="status"
      aria-label={`Status: ${STAGE_LABELS[stage]}`}
    >
      {(stage !== "completed" && stage !== "failed" && stage !== "queued") && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {stage === "completed" && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {stage === "failed" && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {STAGE_LABELS[stage]}
    </span>
  );
}
