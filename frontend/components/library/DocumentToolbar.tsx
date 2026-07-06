import * as React from "react";
import { LayoutGrid, List, Upload, RefreshCw } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { ViewMode } from "./library-types";

export interface DocumentToolbarProps {
  documentCount: number;
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUpload: () => void;
  onRefresh: () => void;
  className?: string;
}

export function DocumentToolbar({
  documentCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  onUpload,
  onRefresh,
  className,
}: DocumentToolbarProps): JSX.Element {
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4", className)}>
      <div className="text-left">
        <h2 className="text-heading-l font-bold text-text-primary">Research Library</h2>
        <p className="text-small text-text-muted">
          {filteredCount === documentCount
            ? `${documentCount} document${documentCount !== 1 ? "s" : ""} indexed`
            : `${filteredCount} of ${documentCount} documents`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* View toggle */}
        <div className="flex items-center rounded-medium border border-border bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "grid" ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
            aria-label="Grid view"
            aria-pressed={viewMode === "grid"}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={cn(
              "p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "table" ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
            )}
            aria-label="Table view"
            aria-pressed={viewMode === "table"}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <Button variant="ghost" size="sm" onClick={onRefresh} className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>

        <Button onClick={onUpload} size="sm" className="flex items-center gap-1.5">
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
      </div>
    </div>
  );
}
