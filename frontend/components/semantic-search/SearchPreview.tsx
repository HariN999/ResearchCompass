import * as React from "react";
import { Eye } from "lucide-react";
import type { SemanticSearchResult } from "../../types/analysis";

function formatFilterValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

export interface SearchPreviewProps {
  result: SemanticSearchResult | null;
}

export function SearchPreview({ result }: SearchPreviewProps): JSX.Element {
  if (!result) {
    return (
      <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="text-body font-semibold text-text-primary">Preview</h3>
        </div>
        <div className="mt-6 rounded-medium border border-dashed border-border bg-background/60 p-4 text-small text-text-secondary">
          Select a result to inspect the matching chunk text and metadata.
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="text-body font-semibold text-text-primary">Preview</h3>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-medium border border-border bg-background/60 p-4">
          <p className="text-small font-semibold text-text-primary">{result.document_title || result.metadata?.document_title || "Untitled document"}</p>
          <p className="mt-2 text-caption text-text-secondary">{result.authors || formatFilterValue(result.metadata?.authors)}</p>
        </div>
        <div className="rounded-medium border border-border bg-background/60 p-4">
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Full chunk text</p>
          <p className="mt-2 text-small leading-7 text-text-secondary">{result.text}</p>
        </div>
        <div className="rounded-medium border border-border bg-background/60 p-4 space-y-2 text-small text-text-secondary">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary">Section</span>
            <span>{formatFilterValue(result.section || result.metadata?.section)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary">Page</span>
            <span>{formatFilterValue(result.page_number ?? result.metadata?.page_number)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary">Similarity</span>
            <span>{Math.round(result.score * 100)}%</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-text-primary">Document</span>
            <span>{formatFilterValue(result.document_id || result.metadata?.document_id)}</span>
          </div>
        </div>
        <div className="rounded-medium border border-dashed border-border bg-background/50 p-4 text-small text-text-secondary">
          Future citation and evidence panels will appear here as the search workspace expands.
        </div>
      </div>
    </aside>
  );
}
