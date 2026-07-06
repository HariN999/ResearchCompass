import * as React from "react";
import { FileText, X, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SelectedFileCardProps {
  file: File;
  error?: string;
  onRemove: () => void;
  className?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SelectedFileCard({
  file,
  error,
  onRemove,
  className,
}: SelectedFileCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-medium border px-4 py-3 transition-colors",
        error
          ? "border-danger/30 bg-danger/5"
          : "border-border bg-surface hover:bg-surface-hover",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-medium shrink-0",
            error
              ? "bg-danger/10 text-danger"
              : "bg-primary/10 text-primary"
          )}
        >
          {error ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 text-left">
          <p className="text-body font-medium text-text-primary truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-caption text-text-muted">
              {formatFileSize(file.size)}
            </span>
            {error && (
              <span className="text-caption text-danger font-medium">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="h-7 w-7 flex items-center justify-center rounded-medium text-text-muted hover:bg-surface-hover hover:text-danger transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Remove ${file.name}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
