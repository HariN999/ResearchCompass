import * as React from "react";
import { FileText, CheckCircle, AlertCircle, X, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { UploadStageBadge } from "./UploadStageBadge";
import { ProgressIndicator } from "./ProgressIndicator";
import type { QueueItem } from "./queue-types";
import { getStageProgress } from "./queue-types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface UploadQueueItemProps {
  item: QueueItem;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  className?: string;
}

export function UploadQueueItem({
  item,
  onRemove,
  onRetry,
  className,
}: UploadQueueItemProps): JSX.Element {
  const progress = getStageProgress(item.stage);
  const isTerminal = item.stage === "completed" || item.stage === "failed";
  const isActive = !isTerminal && item.stage !== "queued";

  const progressVariant =
    item.stage === "completed"
      ? "success"
      : item.stage === "failed"
        ? "danger"
        : "default";

  return (
    <div
      className={cn(
        "rounded-medium border p-4 transition-colors",
        item.stage === "failed"
          ? "border-danger/20 bg-danger/5"
          : item.stage === "completed"
            ? "border-success/20 bg-success/5"
            : "border-border bg-surface",
        className
      )}
    >
      {/* Top row: icon, name, badge, actions */}
      <div className="flex items-center gap-3">
        {/* Status icon */}
        <div
          className={cn(
            "h-9 w-9 flex items-center justify-center rounded-medium shrink-0",
            item.stage === "completed"
              ? "bg-success/10 text-success"
              : item.stage === "failed"
                ? "bg-danger/10 text-danger"
                : isActive
                  ? "bg-primary/10 text-primary"
                  : "bg-surface-hover text-text-secondary"
          )}
        >
          {item.stage === "completed" ? (
            <CheckCircle className="h-4.5 w-4.5" />
          ) : item.stage === "failed" ? (
            <AlertCircle className="h-4.5 w-4.5" />
          ) : (
            <FileText className={cn("h-4.5 w-4.5", isActive && "animate-pulse")} />
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-body font-medium text-text-primary truncate">
            {item.fileName}
          </p>
          <span className="text-caption text-text-muted">
            {formatFileSize(item.fileSize)}
          </span>
        </div>

        {/* Badge + Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <UploadStageBadge stage={item.stage} />

          {item.stage === "failed" && onRetry && (
            <button
              type="button"
              onClick={() => onRetry(item.id)}
              className="h-7 w-7 flex items-center justify-center rounded-medium text-text-muted hover:bg-surface-hover hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Retry ${item.fileName}`}
              title="Retry"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}

          {isTerminal && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="h-7 w-7 flex items-center justify-center rounded-medium text-text-muted hover:bg-surface-hover hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label={`Remove ${item.fileName}`}
              title="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <ProgressIndicator value={progress} variant={progressVariant} />
      </div>

      {/* Error message */}
      {item.stage === "failed" && item.error && (
        <p className="mt-2 text-caption text-danger text-left">
          {item.error}
        </p>
      )}
    </div>
  );
}
