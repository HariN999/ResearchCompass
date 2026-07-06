import * as React from "react";
import { BookOpen, Eye, FileText, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { SemanticSearchResult } from "../../types/analysis";

export interface SearchResultCardProps {
  result: SemanticSearchResult;
  selected?: boolean;
  onSelect: (result: SemanticSearchResult) => void;
  onOpenAnalysis: (result: SemanticSearchResult) => void;
}

function SimilarityBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-caption font-semibold text-primary">
      {Math.round(score * 100)}% match
    </span>
  );
}

export function SearchResultCard({ result, selected = false, onSelect, onOpenAnalysis }: SearchResultCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className={cn(
        "w-full rounded-large border p-4 text-left shadow-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:bg-surface-hover"
      )}
      aria-pressed={selected}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-small font-semibold text-text-primary">{result.document_title || result.metadata?.document_title || "Untitled document"}</p>
          <p className="mt-1 text-caption text-text-secondary">{result.authors || result.metadata?.authors || "Unknown author"}</p>
        </div>
        <SimilarityBadge score={result.score} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-caption text-text-muted">
        <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {result.section || result.metadata?.section || "Unknown"}</span>
        <span className="inline-flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> Page {result.page_number ?? result.metadata?.page_number ?? "—"}</span>
      </div>
      <p className="mt-3 text-small leading-7 text-text-secondary line-clamp-3">{result.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={(event) => { event.stopPropagation(); onOpenAnalysis(result); }}>
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Open Analysis
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={(event) => event.stopPropagation()} disabled>
          <Eye className="mr-2 h-3.5 w-3.5" /> Open PDF
        </Button>
      </div>
    </button>
  );
}
