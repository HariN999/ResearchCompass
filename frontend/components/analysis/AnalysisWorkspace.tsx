import * as React from "react";
import { FileText, FileUp, RefreshCw, Download, ChevronDown, ChevronRight, Sparkles, BookOpen, ScanSearch } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { AnalysisResponse } from "../../types/analysis";
import type { LibraryDocument } from "../library/library-types";

export interface AnalysisWorkspaceProps {
  document: LibraryDocument | null;
  result: AnalysisResponse | null;
  filename: string;
  loading: boolean;
  error: string | null;
  onAnalyze: (file: File) => void | Promise<void>;
  onRefresh?: () => void;
  className?: string;
}

interface SectionDefinition {
  id: string;
  title: string;
  content?: string;
  items?: string[];
  variant?: "default" | "success" | "warning";
}

function getSectionTone(variant: SectionDefinition["variant"]) {
  switch (variant) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/5";
    case "warning":
      return "border-amber-500/20 bg-amber-500/5";
    default:
      return "border-border bg-surface";
  }
}

function AnalysisSection({ section, isOpen, onToggle }: { section: SectionDefinition; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={cn("rounded-large border p-4 shadow-card", getSectionTone(section.variant))}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-body font-semibold text-text-primary">{section.title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4 text-text-muted" /> : <ChevronRight className="h-4 w-4 text-text-muted" />}
      </button>
      {isOpen ? (
        <div className="mt-4 space-y-3">
          {section.content ? (
            <p className="text-small leading-7 text-text-secondary">{section.content}</p>
          ) : null}
          {section.items ? (
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2 text-small leading-6 text-text-secondary">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function MetadataPanel({ document }: { document: LibraryDocument | null }) {
  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="text-body font-semibold text-text-primary">Document metadata</h2>
      </div>

      <div className="mt-4 space-y-4 text-small text-text-secondary">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Title</p>
          <p className="mt-1 font-medium text-text-primary">{document?.title ?? "Select a paper from the library"}</p>
        </div>
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Authors</p>
          <p className="mt-1 font-medium text-text-primary">{document?.authors ?? "—"}</p>
        </div>
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Domain</p>
          <p className="mt-1 font-medium text-text-primary">{document?.domain ?? "—"}</p>
        </div>
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Upload date</p>
          <p className="mt-1 font-medium text-text-primary">{document?.uploadDate ?? "—"}</p>
        </div>
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {document?.tags?.length ? (
              document.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-surface-hover px-2 py-1 text-caption text-text-secondary">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-text-muted">No tags available</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function PDFPreviewPanel({ document, filename }: { document: LibraryDocument | null; filename: string }) {
  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <ScanSearch className="h-4 w-4 text-primary" />
        <h2 className="text-body font-semibold text-text-primary">PDF preview</h2>
      </div>

      <div className="mt-4 flex min-h-[280px] flex-col items-center justify-center rounded-large border border-dashed border-border bg-background/60 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-body font-semibold text-text-primary">Preview placeholder</h3>
        <p className="mt-2 text-small leading-6 text-text-secondary">
          {document ? `${document.title} is ready for future evidence highlighting and inline citation overlays.` : `Upload a PDF to render ${filename || "the manuscript"} here.`}
        </p>
      </div>
    </aside>
  );
}

function LoadingSkeleton() {
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
      <h3 className="text-body font-semibold text-danger">Analysis could not be completed</h3>
      <p className="mt-2 text-small leading-6 text-text-secondary">{message}</p>
    </div>
  );
}

function EmptyState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="mt-6 rounded-large border border-dashed border-border bg-surface/80 p-8 text-center shadow-card">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileUp className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-heading-m font-semibold text-text-primary">Choose a paper to analyze</h3>
      <p className="mx-auto mt-2 max-w-xl text-small leading-6 text-text-secondary">
        Select a document from the research library, then use the workspace controls to run the AI review and inspect the structured results.
      </p>
      <Button onClick={onAnalyze} className="mt-5">
        Analyze a paper
      </Button>
    </div>
  );
}

export function AnalysisWorkspace({
  document,
  result,
  filename,
  loading,
  error,
  onAnalyze,
  onRefresh,
  className,
}: AnalysisWorkspaceProps): JSX.Element {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    executive_summary: true,
    problem_statement: true,
    methodology: true,
    key_contributions: true,
  });

  const sections: SectionDefinition[] = React.useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      { id: "executive_summary", title: "Executive Summary", content: result.executive_summary },
      { id: "problem_statement", title: "Problem Statement", content: result.problem_statement },
      { id: "methodology", title: "Methodology", content: result.methodology },
      { id: "key_contributions", title: "Key Contributions", items: result.key_contributions },
      { id: "strengths", title: "Strengths", items: result.strengths },
      { id: "weaknesses", title: "Weaknesses", items: result.weaknesses },
      { id: "research_gaps", title: "Research Gaps", items: result.research_gaps },
      { id: "novelty_assessment", title: "Novelty Assessment", content: result.novelty_assessment },
      { id: "implementation_improvements", title: "Implementation Improvements", items: result.implementation_improvements },
      { id: "future_work", title: "Future Work", items: result.future_work },
      { id: "viva_questions", title: "Viva Questions", items: result.viva_questions },
    ];
  }, [result]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void onAnalyze(file);
    }
    event.target.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      <input ref={fileInputRef} type="file" accept="application/pdf" className="sr-only" onChange={handleFileSelect} />

      <div className="flex flex-col gap-4 rounded-large border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">AI Analysis Workspace</p>
          <h2 className="text-heading-m font-semibold text-text-primary">
            {document?.title ?? filename ?? "Select a paper"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading || Boolean(result)}>
            <FileUp className="mr-2 h-3.5 w-3.5" /> Analyze
          </Button>
          <Button type="button" variant="outline" size="sm" disabled>
            <Download className="mr-2 h-3.5 w-3.5" /> Export
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onRefresh} disabled={!onRefresh}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : !result ? (
        <EmptyState onAnalyze={() => fileInputRef.current?.click()} />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <MetadataPanel document={document} />

          <div className="space-y-4">
            <div className="rounded-large border border-border bg-surface p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Publication readiness</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-small font-semibold text-primary">
                      {result.publication_readiness_score}/100
                    </span>
                    <p className="text-small leading-6 text-text-secondary">
                      {result.publication_readiness_justification}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {sections.map((section) => (
                <AnalysisSection
                  key={section.id}
                  section={section}
                  isOpen={Boolean(openSections[section.id])}
                  onToggle={() => toggleSection(section.id)}
                />
              ))}
            </div>
          </div>

          <PDFPreviewPanel document={document} filename={filename} />
        </div>
      )}
    </div>
  );
}
