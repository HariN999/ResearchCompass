"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { ResultsDashboard } from "../components/ResultsDashboard";
import { UploadSection } from "../components/UploadSection";
import { AnalysisWorkflow } from "../components/AnalysisWorkflow";
import { analyzeResearchPaper, compareDocuments, generateLiteratureReview, ingestDocuments } from "../lib/api";
import type { AnalysisResponse, ComparisonResponse, LiteratureReviewResponse } from "../types/analysis";
import { AppShell } from "../components/layout/AppShell";
import { HeroSection } from "../components/dashboard/HeroSection";
import { QuickActionCard } from "../components/dashboard/QuickActionCard";
import { StatisticCard } from "../components/dashboard/StatisticCard";
import { RecentActivityList } from "../components/dashboard/RecentActivityList";
import { EmptyState } from "../components/dashboard/EmptyState";
import { MultiUploadPanel } from "../components/upload/MultiUploadPanel";
import { AnalysisWorkspace } from "../components/analysis/AnalysisWorkspace";
import { ComparisonWorkspace } from "../components/comparison/ComparisonWorkspace";
import { LiteratureReviewWorkspace } from "../components/literature/LiteratureReviewWorkspace";
import { DocumentToolbar } from "../components/library/DocumentToolbar";
import { SearchBar } from "../components/library/SearchBar";
import { FilterPanel } from "../components/library/FilterPanel";
import { DocumentGrid } from "../components/library/DocumentGrid";
import { DocumentTable } from "../components/library/DocumentTable";
import {
  FileText,
  Columns,
  Sparkles,
  Search,
  Database,
  Clock,
  FolderOpen
} from "lucide-react";
import {
  PLACEHOLDER_DOCUMENTS,
  type LibraryDocument,
  type LibraryFilters,
  type ViewMode,
} from "../components/library/library-types";

export default function Home(): JSX.Element {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFilename, setAnalyzedFilename] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isEmptyDemo, setIsEmptyDemo] = useState<boolean>(false);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [libraryFilters, setLibraryFilters] = useState<LibraryFilters>({
    search: "",
    domain: "",
    year: "",
    author: "",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [libraryDocuments, setLibraryDocuments] = useState<LibraryDocument[]>(PLACEHOLDER_DOCUMENTS);
  const [libraryMessage, setLibraryMessage] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<LibraryDocument | null>(null);
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState<boolean>(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [comparisonSelection, setComparisonSelection] = useState<LibraryDocument[]>([]);
  const [literatureReview, setLiteratureReview] = useState<LiteratureReviewResponse | null>(null);
  const [literatureReviewLoading, setLiteratureReviewLoading] = useState<boolean>(false);
  const [literatureReviewError, setLiteratureReviewError] = useState<string | null>(null);
  const [literatureReviewSelection, setLiteratureReviewSelection] = useState<LibraryDocument[]>([]);

  const mockActivities = [
    {
      id: "act-1",
      title: "Attention Is All You Need",
      type: "analysis" as const,
      timestamp: "2 hours ago",
      detail: "Completed CS Deep-Critique. Publication readiness score: 92/100.",
    },
    {
      id: "act-2",
      title: "BERT vs GPT Architecture Trade-offs",
      type: "comparison" as const,
      timestamp: "5 hours ago",
      detail: "Generated 2-document methodology comparison matrix.",
    },
    {
      id: "act-3",
      title: "Sparse Attention Mechanics",
      type: "lit-review" as const,
      timestamp: "Yesterday",
      detail: "Synthesized 3-document related work literature review.",
    },
  ];

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard";
      case "library":
        return "Library";
      case "analyze":
        return "Analyze";
      case "compare":
        return "Compare";
      case "literature-review":
        return "Literature Review";
      case "search":
        return "Search";
      case "about":
        return "About";
      case "github":
        return "GitHub Repository";
      default:
        return "Dashboard";
    }
  };

  const getBreadcrumbs = (tab: string) => {
    return ["ResearchCompass", getTabTitle(tab)];
  };

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme(): void {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  }

  async function handleAnalyze(file: File): Promise<void> {
    setLoading(true);
    setError(null);
    setAnalysisFile(file);

    try {
      const analysis = await analyzeResearchPaper(file);
      setResult(analysis);
      setAnalyzedFilename(file.name);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "Something went wrong while analyzing the paper.");
    } finally {
      setLoading(false);
    }
  }

  // Animation variants for Staggered Hero text
  const heroVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } },
  };

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = libraryFilters.search.trim().toLowerCase();

    return libraryDocuments.filter((doc) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [doc.title, doc.authors, doc.domain, doc.fileName, doc.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesDomain = !libraryFilters.domain || doc.domain === libraryFilters.domain;
      const matchesYear = !libraryFilters.year || String(doc.year) === libraryFilters.year;
      const matchesAuthor =
        !libraryFilters.author || doc.authors.toLowerCase().includes(libraryFilters.author.toLowerCase());

      return matchesSearch && matchesDomain && matchesYear && matchesAuthor;
    });
  }, [libraryDocuments, libraryFilters]);

  const handleSelectDocument = (id: string) => {
    const nextDocument = libraryDocuments.find((doc) => doc.id === id) ?? null;
    setSelectedDocument(nextDocument);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllDocuments = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allVisibleSelected = filteredDocuments.length > 0 && filteredDocuments.every((doc) => next.has(doc.id));

      if (allVisibleSelected) {
        filteredDocuments.forEach((doc) => next.delete(doc.id));
      } else {
        filteredDocuments.forEach((doc) => next.add(doc.id));
      }

      return next;
    });
  };

  const handleLibraryAction = (action: string, id: string) => {
    const targetDoc = libraryDocuments.find((doc) => doc.id === id);

    switch (action) {
      case "analyze":
        setSelectedDocument(targetDoc ?? null);
        setActiveTab("analyze");
        setLibraryMessage(`Opened analysis for ${targetDoc?.title ?? "the selected document"}.`);
        break;
      case "compare":
        setComparisonSelection((prev) => {
          if (prev.some((doc) => doc.id === id)) {
            return prev;
          }
          return [...prev, targetDoc ?? null].filter(Boolean) as LibraryDocument[];
        });
        setActiveTab("compare");
        setLibraryMessage(`Added ${targetDoc?.title ?? "the selected document"} to the comparison workspace.`);
        break;
      case "literature-review":
        setLiteratureReviewSelection((prev) => {
          if (prev.some((doc) => doc.id === id)) {
            return prev;
          }
          return [...prev, targetDoc ?? null].filter(Boolean) as LibraryDocument[];
        });
        setActiveTab("literature-review");
        setLibraryMessage(`Added ${targetDoc?.title ?? "the selected document"} to the literature review workspace.`);
        break;
      case "delete":
        setLibraryDocuments((prev) => prev.filter((doc) => doc.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setLibraryMessage(`Removed ${targetDoc?.title ?? "the selected document"} from the library.`);
        break;
      default:
        break;
    }
  };

  const handleCompareSelection = async () => {
    if (comparisonSelection.length < 2) {
      setComparisonError("Select at least two papers to compare.");
      return;
    }

    setComparisonLoading(true);
    setComparisonError(null);

    try {
      const response = await compareDocuments(comparisonSelection.map((doc) => doc.id));
      setComparison(response);
    } catch (err) {
      setComparison(null);
      setComparisonError(err instanceof Error ? err.message : "Something went wrong while comparing the papers.");
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleRemoveComparisonPaper = (id: string) => {
    setComparisonSelection((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleMoveComparisonPaper = (id: string, direction: "up" | "down") => {
    setComparisonSelection((prev) => {
      const index = prev.findIndex((doc) => doc.id === id);
      if (index < 0) {
        return prev;
      }

      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleResetComparison = () => {
    setComparisonSelection([]);
    setComparison(null);
    setComparisonError(null);
  };

  const handleGenerateLiteratureReview = async () => {
    if (literatureReviewSelection.length < 2) {
      setLiteratureReviewError("Select at least two papers to generate a literature review.");
      return;
    }

    setLiteratureReviewLoading(true);
    setLiteratureReviewError(null);

    try {
      const response = await generateLiteratureReview(literatureReviewSelection.map((doc) => doc.id));
      setLiteratureReview(response);
    } catch (err) {
      setLiteratureReview(null);
      setLiteratureReviewError(err instanceof Error ? err.message : "Something went wrong while generating the literature review.");
    } finally {
      setLiteratureReviewLoading(false);
    }
  };

  const handleRemoveLiteraturePaper = (id: string) => {
    setLiteratureReviewSelection((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleMoveLiteraturePaper = (id: string, direction: "up" | "down") => {
    setLiteratureReviewSelection((prev) => {
      const index = prev.findIndex((doc) => doc.id === id);
      if (index < 0) {
        return prev;
      }

      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) {
        return prev;
      }

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleResetLiteratureReview = () => {
    setLiteratureReviewSelection([]);
    setLiteratureReview(null);
    setLiteratureReviewError(null);
  };

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      title={getTabTitle(activeTab)}
      breadcrumbs={getBreadcrumbs(activeTab)}
    >
      {activeTab === "dashboard" && (
        <div className="relative z-10 w-full px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            
            {/* LANDING HERO VIEW */}
            {!result && !loading ? (
              <div className="space-y-8 select-none">
                
                {/* Welcome Hero and Demo Toggle Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-border pb-6 gap-6">
                  <HeroSection
                    onPrimaryClick={() => setIsUploadOpen(true)}
                    onSecondaryClick={() => setActiveTab("library")}
                  />
                  
                  <button
                    type="button"
                    onClick={() => setIsEmptyDemo(!isEmptyDemo)}
                    className="self-start px-3.5 py-1.5 text-caption font-semibold rounded-medium border border-border text-text-secondary bg-surface hover:bg-surface-hover hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {isEmptyDemo ? "Show Populated Dashboard" : "Show Empty State Demo"}
                  </button>
                </div>

                {isEmptyDemo ? (
                  <EmptyState onActionClick={() => setIsUploadOpen(true)} />
                ) : (
                  <>
                    {/* Platform Overview */}
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                      <StatisticCard label="Papers Indexed" value="12" icon={FolderOpen} change="+3 this week" />
                      <StatisticCard label="Comparisons Generated" value="4" icon={Columns} change="+1 yesterday" />
                      <StatisticCard label="Literature Reviews" value="2" icon={Sparkles} change="Active" changeType="neutral" />
                      <StatisticCard label="Last Activity" value="2 hrs ago" icon={Clock} change="Completed" changeType="neutral" />
                    </div>

                    {/* Main Content Layout */}
                    <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                      {/* Left: Quick Actions */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <h3 className="text-heading-m font-bold text-text-primary text-left">
                          Research Workspaces
                        </h3>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
                          <QuickActionCard
                            icon={FileText}
                            title="Analyze Paper"
                            description="Run critique analysis and extract baselines on a new PDF."
                            onClick={() => setIsUploadOpen(true)}
                          />
                          <QuickActionCard
                            icon={Columns}
                            title="Compare Papers"
                            description="Build comparison matrices comparing methodology columns."
                            onClick={() => setActiveTab("compare")}
                          />
                          <QuickActionCard
                            icon={Sparkles}
                            title="Literature Review"
                            description="Draft synthesized Related Work markdown documents."
                            onClick={() => setActiveTab("literature-review")}
                          />
                          <QuickActionCard
                            icon={Search}
                            title="Semantic Search"
                            description="Query indexed paragraphs across libraries using NLP search."
                            onClick={() => setActiveTab("search")}
                          />
                        </div>
                      </div>

                      {/* Right: Recent Activity */}
                      <div className="lg:col-span-7">
                        <RecentActivityList activities={mockActivities} />
                      </div>
                    </div>
                  </>
                )}

                {/* Upload Modal Drawer */}
                {isUploadOpen && (
                  <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsUploadOpen(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Upload research papers"
                  >
                    <div className="bg-surface border border-border rounded-large max-w-xl w-full p-6 shadow-dialog relative max-h-[85vh] overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => setIsUploadOpen(false)}
                        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-medium border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                        aria-label="Close modal"
                      >
                        ✕
                      </button>
                      <h3 className="text-heading-m font-bold text-text-primary mb-1 text-left">
                        Upload Research Papers
                      </h3>
                      <p className="text-small text-text-secondary mb-5 text-left">
                        Select one or more PDF manuscripts for ingestion into the vector library.
                      </p>
                      <MultiUploadPanel
                        onUpload={async (files) => {
                          const response = await ingestDocuments(files);
                          return response.results;
                        }}
                      />
                    </div>
                  </div>
                )}

              </div>
            ) : null}

            {/* LOADING STATE FOCUS VIEW */}
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto py-8 text-center"
              >
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Research Review in Progress
                </h2>
                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                  The analysis pipeline is evaluating your manuscript...
                </p>
                <AnalysisWorkflow loading={loading} />
              </motion.div>
            )}

            {/* ERROR STATE */}
            {error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-2xl mx-auto mt-6 rounded-lg border border-red-500/25 bg-red-50 dark:bg-red-950/20 p-4 text-left border-l-4 border-l-red-500 text-red-800 dark:text-red-400"
              >
                <p className="text-sm leading-6">{error}</p>
              </motion.div>
            ) : null}

            {/* RESULTS VIEW */}
            {result && !loading ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 mb-24"
              >
                {/* Header info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 mb-8 border-b border-slate-200 dark:border-slate-800/80">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Manuscript Analysis Report
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Comprehensive review outcomes for {analyzedFilename}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setResult(null); setError(null); }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                  >
                    ← Analyze Another Paper
                  </button>
                </div>
                <ResultsDashboard result={result} filename={analyzedFilename} />
              </motion.div>
            ) : null}
            
          </AnimatePresence>
        </div>
      )}

      {activeTab === "analyze" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">
            <AnalysisWorkspace
              document={selectedDocument}
              result={result}
              filename={analyzedFilename}
              loading={loading}
              error={error}
              onAnalyze={handleAnalyze}
              onRefresh={() => {
                if (analysisFile) {
                  void handleAnalyze(analysisFile);
                }
              }}
            />
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">
            <ComparisonWorkspace
              selectedPapers={comparisonSelection}
              onRemovePaper={handleRemoveComparisonPaper}
              onMovePaper={handleMoveComparisonPaper}
              onAddPaper={() => setActiveTab("library")}
              onCompare={handleCompareSelection}
              onReset={handleResetComparison}
              onBackToLibrary={() => setActiveTab("library")}
              comparison={comparison}
              loading={comparisonLoading}
              error={comparisonError}
            />
          </div>
        </div>
      )}

      {activeTab === "literature-review" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="mx-auto w-full max-w-7xl">
            <LiteratureReviewWorkspace
              selectedPapers={literatureReviewSelection}
              onRemovePaper={handleRemoveLiteraturePaper}
              onMovePaper={handleMoveLiteraturePaper}
              onAddPaper={() => setActiveTab("library")}
              onGenerate={handleGenerateLiteratureReview}
              onReset={handleResetLiteratureReview}
              onBackToLibrary={() => setActiveTab("library")}
              review={literatureReview}
              loading={literatureReviewLoading}
              error={literatureReviewError}
            />
          </div>
        </div>
      )}

      {activeTab === "library" && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <DocumentToolbar
              documentCount={libraryDocuments.length}
              filteredCount={filteredDocuments.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onUpload={() => setIsUploadOpen(true)}
              onRefresh={() => {
                setLibraryFilters({ search: "", domain: "", year: "", author: "" });
                setSelectedIds(new Set());
                setLibraryMessage("Library refreshed from the current workspace.");
              }}
            />

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <SearchBar
                value={libraryFilters.search}
                onChange={(value) => setLibraryFilters((prev) => ({ ...prev, search: value }))}
                className="lg:flex-1"
              />
              <FilterPanel filters={libraryFilters} onChange={setLibraryFilters} />
            </div>

            {libraryMessage ? (
              <div className="rounded-medium border border-primary/20 bg-primary/5 px-3 py-2 text-small text-primary">
                {libraryMessage}
              </div>
            ) : null}

            {filteredDocuments.length === 0 ? (
              <div className="rounded-large border border-dashed border-border bg-surface/70 p-8 text-center shadow-card">
                <h3 className="text-heading-m font-semibold text-text-primary">No documents match your filters</h3>
                <p className="mt-2 text-body text-text-secondary">
                  Try broadening your search or clearing the active filters to see more papers.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <DocumentGrid
                documents={filteredDocuments}
                selectedIds={selectedIds}
                onSelect={handleSelectDocument}
                onAction={handleLibraryAction}
              />
            ) : (
              <DocumentTable
                documents={filteredDocuments}
                selectedIds={selectedIds}
                onSelect={handleSelectDocument}
                onSelectAll={handleSelectAllDocuments}
                onAction={handleLibraryAction}
              />
            )}
          </div>
        </div>
      )}

      {activeTab !== "dashboard" && activeTab !== "library" && activeTab !== "analyze" && activeTab !== "compare" && activeTab !== "literature-review" && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface border border-border rounded-large p-8 text-center shadow-card">
            <h2 className="text-heading-l font-bold text-text-primary mb-2">
              {getTabTitle(activeTab)}
            </h2>
            <p className="text-body text-text-secondary mb-6">
              This module will be connected in an upcoming sprint. ResearchCompass v2 backend capabilities for this workspace are ready.
            </p>
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary border border-primary/20 px-3 py-1 text-caption font-semibold">
              Planned for Release
            </span>
          </div>
        </div>
      )}
    </AppShell>
  );
}
