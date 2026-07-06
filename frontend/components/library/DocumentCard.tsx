import * as React from "react";
import { FileText, Sparkles, Columns, Trash2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";
import type { LibraryDocument } from "./library-types";

export interface DocumentCardProps {
  document: LibraryDocument;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onAction?: (action: string, id: string) => void;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({
  document: doc,
  selected = false,
  onSelect,
  onAction,
  className,
}: DocumentCardProps): JSX.Element {
  return (
    <div
      className={cn(
        "group rounded-large border p-5 transition-all duration-200 text-left cursor-pointer select-none",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-border bg-surface hover:border-primary/30 hover:shadow-card",
        className
      )}
      onClick={() => onSelect?.(doc.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect?.(doc.id); } }}
      aria-selected={selected}
      aria-label={`${doc.title} by ${doc.authors}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-9 w-9 flex items-center justify-center rounded-medium bg-primary/10 text-primary shrink-0">
          <FileText className="h-4.5 w-4.5" />
        </div>
        <Badge variant={doc.status === "indexed" ? "success" : doc.status === "processing" ? "primary" : "danger"}>
          {doc.status === "indexed" ? "Indexed" : doc.status === "processing" ? "Processing" : "Failed"}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="text-body font-bold text-text-primary mb-1 line-clamp-2 leading-snug">
        {doc.title}
      </h3>
      <p className="text-small text-text-secondary mb-3 truncate">
        {doc.authors}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-text-muted mb-3">
        {doc.year && <span>{doc.year}</span>}
        <span>{doc.pageCount} pages</span>
        <span>{formatSize(doc.fileSizeBytes)}</span>
        <span>{doc.chunkCount} chunks</span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {doc.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex rounded-full bg-surface-hover border border-border px-2 py-0.5 text-caption text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Quick actions */}
      <div
        className="flex items-center gap-2 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onAction?.("analyze", doc.id)}
          className="flex items-center gap-1 text-caption font-medium text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <FileText className="h-3 w-3" /> Analyze
        </button>
        <button
          type="button"
          onClick={() => onAction?.("compare", doc.id)}
          className="flex items-center gap-1 text-caption font-medium text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Columns className="h-3 w-3" /> Compare
        </button>
        <button
          type="button"
          onClick={() => onAction?.("literature-review", doc.id)}
          className="flex items-center gap-1 text-caption font-medium text-text-secondary hover:text-primary transition-colors px-2 py-1 rounded-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Sparkles className="h-3 w-3" /> Review
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onAction?.("delete", doc.id)}
          className="flex items-center gap-1 text-caption font-medium text-text-muted hover:text-danger transition-colors px-2 py-1 rounded-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
