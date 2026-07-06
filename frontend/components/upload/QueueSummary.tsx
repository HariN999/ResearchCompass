import * as React from "react";
import { cn } from "../../lib/utils";
import type { QueueItem } from "./queue-types";

export interface QueueSummaryProps {
  items: QueueItem[];
  className?: string;
}

export function QueueSummary({ items, className }: QueueSummaryProps): JSX.Element {
  if (items.length === 0) return <></>;

  const counts = {
    queued: items.filter((i) => i.stage === "queued").length,
    processing: items.filter(
      (i) => i.stage !== "queued" && i.stage !== "completed" && i.stage !== "failed"
    ).length,
    completed: items.filter((i) => i.stage === "completed").length,
    failed: items.filter((i) => i.stage === "failed").length,
  };

  const total = items.length;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-medium border border-border bg-surface p-4 text-left select-none",
        className
      )}
    >
      <div className="flex-1 min-w-[140px]">
        <p className="text-body font-semibold text-text-primary">
          Processing Queue
        </p>
        <p className="text-caption text-text-muted">
          {total} file{total !== 1 ? "s" : ""} total
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {counts.queued > 0 && (
          <span className="inline-flex items-center gap-1.5 text-caption text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-text-muted" />
            {counts.queued} queued
          </span>
        )}
        {counts.processing > 0 && (
          <span className="inline-flex items-center gap-1.5 text-caption text-primary font-medium">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {counts.processing} processing
          </span>
        )}
        {counts.completed > 0 && (
          <span className="inline-flex items-center gap-1.5 text-caption text-success font-medium">
            <span className="h-2 w-2 rounded-full bg-success" />
            {counts.completed} completed
          </span>
        )}
        {counts.failed > 0 && (
          <span className="inline-flex items-center gap-1.5 text-caption text-danger font-medium">
            <span className="h-2 w-2 rounded-full bg-danger" />
            {counts.failed} failed
          </span>
        )}
      </div>
    </div>
  );
}
