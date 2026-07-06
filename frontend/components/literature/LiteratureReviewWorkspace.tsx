import * as React from "react";
import { ArrowLeft, Copy, Download, FileText, Plus, RotateCcw, Sparkles, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";
import type { LibraryDocument } from "../library/library-types";
import type { LiteratureReviewResponse } from "../../types/analysis";

export interface LiteratureReviewWorkspaceProps {
  selectedPapers: LibraryDocument[];
  onRemovePaper: (id: string) => void;
  onMovePaper: (id: string, direction: "up" | "down") => void;
  onAddPaper: () => void;
  onGenerate: () => void;
  onReset: () => void;
  onBackToLibrary: () => void;
  review: LiteratureReviewResponse | null;
  loading: boolean;
  error: string | null;
  className?: string;
}

interface ReviewSectionDefinition {
  id: string;
  title: string;
  content: string;
}

function GenerationToolbar({
  selectedCount,
  onGenerate,
  onReset,
  onBackToLibrary,
  onCopy,
  onExportMarkdown,
  loading,
  canGenerate,
}: {
  selectedCount: number;
  onGenerate: () => void;
  onReset: () => void;
  onBackToLibrary: () => void;
  onCopy: () => void;
  onExportMarkdown: () => void;
  loading: boolean;
  canGenerate: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-large border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Literature Review Workspace</p>
        <h2 className="text-heading-m font-semibold text-text-primary">
          {selectedCount >= 2 ? `${selectedCount} papers selected` : "Select at least two papers"}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onBackToLibrary}>
          <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Library
        </Button>
        <Button type="button" size="sm" onClick={onGenerate} disabled={loading || !canGenerate}>
          <Sparkles className="mr-2 h-3.5 w-3.5" /> Generate
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <Copy className="mr-2 h-3.5 w-3.5" /> Copy
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onExportMarkdown}>
          <Download className="mr-2 h-3.5 w-3.5" /> Export
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" /> Reset
        </Button>
      </div>
    </div>
  );
}

function SelectedPaperPanel({
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
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-4 w-4 text-primary" />
        <h2 className="text-body font-semibold text-text-primary">Selected papers</h2>
      </div>

      <div className="mt-4 space-y-3">
        {papers.length === 0 ? (
          <div className="rounded-medium border border-dashed border-border bg-background/60 p-4 text-small text-text-secondary">
            Choose at least two papers from the library to start the review.
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

function GenerationSettingsPanel({
  writingStyle,
  length,
  tone,
  onWritingStyleChange,
  onLengthChange,
  onToneChange,
}: {
  writingStyle: string;
  length: string;
  tone: string;
  onWritingStyleChange: (value: string) => void;
  onLengthChange: (value: string) => void;
  onToneChange: (value: string) => void;
}) {
  const selectClass = "w-full rounded-medium border border-border bg-surface px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";

  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-body font-semibold text-text-primary">Generation settings</h2>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="writing-style">
            Writing style
          </label>
          <select id="writing-style" value={writingStyle} onChange={(e) => onWritingStyleChange(e.target.value)} className={selectClass}>
            <option value="IEEE">IEEE</option>
            <option value="ACM">ACM</option>
            <option value="APA">APA</option>
            <option value="Generic Academic">Generic Academic</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="length">
            Length
          </label>
          <select id="length" value={length} onChange={(e) => onLengthChange(e.target.value)} className={selectClass}>
            <option value="Short">Short</option>
            <option value="Medium">Medium</option>
            <option value="Long">Long</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="tone">
            Tone
          </label>
          <select id="tone" value={tone} onChange={(e) => onToneChange(e.target.value)} className={selectClass}>
            <option value="Formal">Formal</option>
            <option value="Concise">Concise</option>
            <option value="Detailed">Detailed</option>
          </select>
        </div>
      </div>
    </aside>
  );
}

function LiteratureReviewEditor({
  review,
  editableContent,
  onEdit,
}: {
  review: LiteratureReviewResponse | null;
  editableContent: string;
  onEdit: (value: string) => void;
}) {
  const sections: ReviewSectionDefinition[] = review
    ? [
        { id: "overview", title: "Overview", content: review.overview },
        { id: "major_themes", title: "Major Themes", content: review.major_themes },
        { id: "methodology_trends", title: "Methodology Trends", content: review.methodology_trends },
        { id: "strengths", title: "Strengths", content: review.strengths },
        { id: "limitations", title: "Limitations", content: review.limitations },
        { id: "research_trends", title: "Research Trends", content: review.research_trends },
        { id: "open_challenges", title: "Open Challenges", content: review.open_challenges },
        { id: "future_directions", title: "Future Directions", content: review.future_directions },
        { id: "generated_literature_review", title: "Generated Literature Review", content: editableContent },
      ]
    : [];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.id} className="rounded-large border border-border bg-surface p-4 shadow-card">
          <h3 className="text-body font-semibold text-text-primary">{section.title}</h3>
          {section.id === "generated_literature_review" ? (
            <textarea
              value={editableContent}
              onChange={(e) => onEdit(e.target.value)}
              className="mt-3 min-h-[240px] w-full rounded-medium border border-border bg-background/60 px-3 py-3 text-small leading-7 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Edit generated literature review"
            />
          ) : (
            <p className="mt-3 text-small leading-7 text-text-secondary">{section.content}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ReviewSkeleton() {
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
      <h3 className="text-body font-semibold text-danger">Review generation failed</h3>
      <p className="mt-2 text-small leading-6 text-text-secondary">{message}</p>
    </div>
  );
}

function EmptyState({ onAddPaper }: { onAddPaper: () => void }) {
  return (
    <div className="mt-6 rounded-large border border-dashed border-border bg-surface/80 p-8 text-center shadow-card">
      <h3 className="text-heading-m font-semibold text-text-primary">No review selected</h3>
      <p className="mx-auto mt-2 max-w-xl text-small leading-6 text-text-secondary">
        Choose at least two papers from the library and generate a literature review to begin drafting your academic summary.
      </p>
      <Button onClick={onAddPaper} className="mt-5">
        <Plus className="mr-2 h-3.5 w-3.5" /> Select papers
      </Button>
    </div>
  );
}

export function LiteratureReviewWorkspace({
  selectedPapers,
  onRemovePaper,
  onMovePaper,
  onAddPaper,
  onGenerate,
  onReset,
  onBackToLibrary,
  review,
  loading,
  error,
  className,
}: LiteratureReviewWorkspaceProps): JSX.Element {
  const [editableContent, setEditableContent] = React.useState("");
  const [writingStyle, setWritingStyle] = React.useState("IEEE");
  const [length, setLength] = React.useState("Medium");
  const [tone, setTone] = React.useState("Formal");

  React.useEffect(() => {
    if (review?.generated_literature_review) {
      setEditableContent(review.generated_literature_review);
    }
  }, [review]);

  const handleCopy = async () => {
    if (!editableContent) {
      return;
    }
    await navigator.clipboard.writeText(editableContent);
  };

  const handleExportMarkdown = () => {
    if (!editableContent) {
      return;
    }
    const blob = new Blob([editableContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "literature-review.md";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("w-full", className)}>
      <GenerationToolbar
        selectedCount={selectedPapers.length}
        onGenerate={onGenerate}
        onReset={onReset}
        onBackToLibrary={onBackToLibrary}
        onCopy={handleCopy}
        onExportMarkdown={handleExportMarkdown}
        loading={loading}
        canGenerate={selectedPapers.length >= 2}
      />

      {loading ? (
        <ReviewSkeleton />
      ) : error ? (
        <ErrorState message={error} />
      ) : !review ? (
        <EmptyState onAddPaper={onAddPaper} />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <SelectedPaperPanel
            papers={selectedPapers}
            onRemovePaper={onRemovePaper}
            onMovePaper={onMovePaper}
            onAddPaper={onAddPaper}
          />

          <LiteratureReviewEditor review={review} editableContent={editableContent} onEdit={setEditableContent} />

          <GenerationSettingsPanel
            writingStyle={writingStyle}
            length={length}
            tone={tone}
            onWritingStyleChange={setWritingStyle}
            onLengthChange={setLength}
            onToneChange={setTone}
          />
        </div>
      )}
    </div>
  );
}
