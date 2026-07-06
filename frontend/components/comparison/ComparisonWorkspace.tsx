import * as React from "react";
import { ArrowDown, ArrowUp, FileText, Plus, RotateCcw, Sparkles, Trash2, Download, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { LibraryDocument } from "../library/library-types";
import type { ComparisonResponse } from "../../types/analysis";

export interface ComparisonWorkspaceProps {
  selectedPapers: LibraryDocument[];
  onRemovePaper: (id: string) => void;
  onMovePaper: (id: string, direction: "up" | "down") => void;
  onAddPaper: () => void;
  onCompare: () => void;
  onReset: () => void;
  onBackToLibrary: () => void;
  comparison: ComparisonResponse | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

interface ComparisonSectionDefinition {
  id: string;
  title: string;
  content?: string;
}

function ComparisonHeader({
  selectedCount,
  onCompare,
  onReset,
  onBackToLibrary,
  loading,
  canCompare,
}: {
  selectedCount: number;
  onCompare: () => void;
  onReset: () => void;
  onBackToLibrary: () => void;
  loading: boolean;
  canCompare: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-large border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Research Paper Comparison</p>
        <h2 className="text-heading-m font-semibold text-text-primary">
          {selectedCount >= 2 ? `${selectedCount} papers selected` : "Select at least two papers"}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onBackToLibrary}>
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Library
        </Button>
        <Button type="button" size="sm" onClick={onCompare} disabled={loading || !canCompare}>
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Compare
        </Button>
        <Button type="button" variant="outline" size="sm" disabled>
          <Download className="mr-2 h-3.5 w-3.5" /> Export
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}

function SelectedPaperList({
  papers,
  onRemovePaper,
  onMovePaper,
  onAddPaper,
}: {
  papers: LibraryDocument[];
  onRemovePaper: (id: string) => void;
  onMovePaper: (id: string, direction: "up" | "down") => void;
  onAddPaper: () => void;
}) {
  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-body font-semibold text-text-primary">Selected papers</h2>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {papers.length === 0 ? (
          <div className="rounded-medium border border-dashed border-border bg-background/60 p-4 text-small text-text-secondary">
            Select two or more papers from the library to begin a comparison.
          </div>
        ) : (
          papers.map((paper, index) => (
            <div key={paper.id} className="rounded-medium border border-border bg-background/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-small font-semibold text-text-primary">{paper.title}</p>
                  <p className="mt-1 text-caption text-text-secondary">{paper.authors}</p>
                  <p className="mt-1 text-caption text-text-muted">
                    {paper.domain} • {paper.year ?? "—"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePaper(paper.id)}
                  className="rounded-small p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-danger"
                  aria-label={`Remove ${paper.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onMovePaper(paper.id, "up")}
                  className="rounded-small border border-border px-2 py-1 text-caption text-text-secondary transition-colors hover:bg-surface-hover"
                  disabled={index === 0}
                >
                  <ArrowUp className="mr-1 inline h-3 w-3" /> Up
                </button>
                <button
                  type="button"
                  onClick={() => onMovePaper(paper.id, "down")}
                  className="rounded-small border border-border px-2 py-1 text-caption text-text-secondary transition-colors hover:bg-surface-hover"
                  disabled={index === papers.length - 1}
                >
                  <ArrowDown className="mr-1 inline h-3 w-3" /> Down
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Button type="button" variant="secondary" className="mt-4 w-full" onClick={onAddPaper}>
        <Plus className="mr-2 h-3.5 w-3.5" /> Add another paper
      </Button>
    </aside>
  );
}

function ComparisonSection({
  title,
  content,
  isOpen,
  onToggle,
}: {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-large border border-border bg-surface p-4 shadow-card">
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={onToggle} aria-expanded={isOpen}>
        <span className="text-body font-semibold text-text-primary">{title}</span>
        <span className="text-caption font-medium text-text-muted">{isOpen ? "Collapse" : "Expand"}</span>
      </button>
      {isOpen ? <p className="mt-4 text-small leading-7 text-text-secondary">{content}</p> : null}
    </div>
  );
}

function ComparisonMatrix({ papers }: { papers: LibraryDocument[] }) {
  const primaryPapers = papers.slice(0, 2);
  const rows = [
    { label: "Problem", valueA: primaryPapers[0]?.title ?? "Select Paper A", valueB: primaryPapers[1]?.title ?? "Select Paper B" },
    { label: "Method", valueA: primaryPapers[0]?.domain ?? "—", valueB: primaryPapers[1]?.domain ?? "—" },
    { label: "Dataset", valueA: "Document corpus details", valueB: "Document corpus details" },
    { label: "Metrics", valueA: "Evaluation framing", valueB: "Evaluation framing" },
    { label: "Results", valueA: primaryPapers[0]?.year ? `Published ${primaryPapers[0].year}` : "—", valueB: primaryPapers[1]?.year ? `Published ${primaryPapers[1].year}` : "—" },
    { label: "Strengths", valueA: "Highlights and contributions", valueB: "Highlights and contributions" },
    { label: "Weaknesses", valueA: "Limitations and risks", valueB: "Limitations and risks" },
  ];

  return (
    <div className="overflow-x-auto rounded-large border border-border bg-surface shadow-card">
      <table className="min-w-full text-left">
        <thead>
          <tr className="border-b border-border bg-surface-hover">
            <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide text-text-secondary">Aspect</th>
            <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide text-text-secondary">Paper A</th>
            <th className="px-4 py-3 text-caption font-semibold uppercase tracking-wide text-text-secondary">Paper B</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-border last:border-b-0">
              <td className="px-4 py-3 text-small font-semibold text-text-primary">{row.label}</td>
              <td className="px-4 py-3 text-small text-text-secondary">{row.valueA}</td>
              <td className="px-4 py-3 text-small text-text-secondary">{row.valueB}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="mt-6 space-y-4">
      {[0, 1, 2].map((index) => (
        <div key={index} className="rounded-large border border-border bg-surface p-4 shadow-card">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
          <div className="mt-4 space-y-3">
            <div className="h-3 w-full animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-surface-hover" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-surface-hover" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-large border border-danger/20 bg-danger/5 p-6 text-left shadow-card">
      <h3 className="text-body font-semibold text-danger">Comparison could not be completed</h3>
      <p className="mt-2 text-small leading-6 text-text-secondary">{message}</p>
    </div>
  );
}

function EmptyState({ onAddPaper }: { onAddPaper: () => void }) {
  return (
    <div className="mt-6 rounded-large border border-dashed border-border bg-surface/80 p-8 text-center shadow-card">
      <h3 className="text-heading-m font-semibold text-text-primary">No comparison selected</h3>
      <p className="mx-auto mt-2 max-w-xl text-small leading-6 text-text-secondary">
        Choose at least two papers from the library and launch the comparison workspace to review the AI-generated analysis.
      </p>
      <Button onClick={onAddPaper} className="mt-5">
        <Plus className="mr-2 h-3.5 w-3.5" /> Select papers
      </Button>
    </div>
  );
}

export function ComparisonWorkspace({
  selectedPapers,
  onRemovePaper,
  onMovePaper,
  onAddPaper,
  onCompare,
  onReset,
  onBackToLibrary,
  comparison,
  loading,
  error,
  className,
}: ComparisonWorkspaceProps): JSX.Element {
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    executive_comparison: true,
    similarities: true,
    differences: true,
    methodology_comparison: true,
  });

  const sections: ComparisonSectionDefinition[] = React.useMemo(() => {
    if (!comparison) {
      return [];
    }

    return [
      { id: "executive_comparison", title: "Executive Summary", content: comparison.executive_comparison },
      { id: "similarities", title: "Common Themes", content: comparison.similarities },
      { id: "differences", title: "Key Differences", content: comparison.differences },
      { id: "methodology_comparison", title: "Methodology Comparison", content: comparison.methodology_comparison },
      { id: "dataset_comparison", title: "Dataset Comparison", content: comparison.dataset_comparison },
      { id: "strength_comparison", title: "Strengths", content: comparison.strength_comparison },
      { id: "weakness_comparison", title: "Weaknesses", content: comparison.weakness_comparison },
      { id: "overall_recommendation", title: "Overall Recommendation", content: comparison.overall_recommendation },
    ];
  }, [comparison]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn("w-full", className)}>
      <ComparisonHeader
        selectedCount={selectedPapers.length}
        onCompare={onCompare}
        onReset={onReset}
        onBackToLibrary={onBackToLibrary}
        loading={loading}
        canCompare={selectedPapers.length >= 2}
      />

      {loading ? (
        <ComparisonSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : !comparison ? (
        <EmptyState onAddPaper={onAddPaper} />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <SelectedPaperList
            papers={selectedPapers}
            onRemovePaper={onRemovePaper}
            onMovePaper={onMovePaper}
            onAddPaper={onAddPaper}
          />

          <div className="space-y-3">
            {sections.map((section) => (
              <ComparisonSection
                key={section.id}
                title={section.title}
                content={section.content ?? ""}
                isOpen={Boolean(openSections[section.id])}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </div>

          <div className="space-y-4">
            <div className="rounded-large border border-border bg-surface p-5 shadow-card">
              <h3 className="text-body font-semibold text-text-primary">Comparison matrix</h3>
              <p className="mt-2 text-small leading-6 text-text-secondary">
                A compact matrix for the selected papers, ready for future citation overlays and evidence highlights.
              </p>
            </div>
            <ComparisonMatrix papers={selectedPapers} />
          </div>
        </div>
      )}
    </div>
  );
}
