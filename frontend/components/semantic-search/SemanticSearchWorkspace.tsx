import * as React from "react";
import { cn } from "../../lib/utils";
import type { SemanticSearchResult } from "../../types/analysis";
import { SearchFilters } from "./SearchFilters";
import { SearchPreview } from "./SearchPreview";
import { SearchResultCard } from "./SearchResultCard";
import { SearchSkeleton } from "./SearchSkeleton";
import { SearchToolbar } from "./SearchToolbar";

export interface SemanticSearchWorkspaceProps {
  query: string;
  results: SemanticSearchResult[];
  loading: boolean;
  error: string | null;
  onQueryChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  onOpenAnalysis: (result: SemanticSearchResult) => void;
  className?: string;
}

export function SemanticSearchWorkspace({
  query,
  results,
  loading,
  error,
  onQueryChange,
  onSearch,
  onClear,
  onOpenAnalysis,
  className,
}: SemanticSearchWorkspaceProps): JSX.Element {
  const [selectedResultId, setSelectedResultId] = React.useState<string | null>(null);
  const [filters, setFilters] = React.useState({
    domain: "",
    year: "",
    author: "",
    minSimilarity: "0",
  });

  React.useEffect(() => {
    if (results.length === 0) {
      setSelectedResultId(null);
      return;
    }

    if (!selectedResultId || !results.some((result) => result.id === selectedResultId)) {
      setSelectedResultId(results[0].id);
    }
  }, [results, selectedResultId]);

  const domainOptions = React.useMemo(() => {
    const values = new Set<string>();
    results.forEach((result) => {
      const domain = result.metadata?.research_domain ?? result.metadata?.domain;
      if (domain) {
        values.add(String(domain));
      }
    });
    return Array.from(values).sort();
  }, [results]);

  const yearOptions = React.useMemo(() => {
    const values = new Set<string>();
    results.forEach((result) => {
      const year = result.metadata?.publication_year ?? result.metadata?.year;
      if (year) {
        values.add(String(year));
      }
    });
    return Array.from(values).sort();
  }, [results]);

  const authorOptions = React.useMemo(() => {
    const values = new Set<string>();
    results.forEach((result) => {
      const author = result.authors || result.metadata?.authors;
      if (author) {
        values.add(String(author));
      }
    });
    return Array.from(values).sort();
  }, [results]);

  const filteredResults = React.useMemo(() => {
    const minSimilarity = Number(filters.minSimilarity || 0);

    return results.filter((result) => {
      const matchesDomain = !filters.domain || String(result.metadata?.research_domain ?? result.metadata?.domain ?? "") === filters.domain;
      const matchesYear = !filters.year || String(result.metadata?.publication_year ?? result.metadata?.year ?? "") === filters.year;
      const matchesAuthor = !filters.author || String(result.authors || result.metadata?.authors || "").toLowerCase().includes(filters.author.toLowerCase());
      const matchesSimilarity = result.score >= minSimilarity;
      return matchesDomain && matchesYear && matchesAuthor && matchesSimilarity;
    });
  }, [filters, results]);

  React.useEffect(() => {
    if (selectedResultId && !filteredResults.some((result) => result.id === selectedResultId)) {
      setSelectedResultId(filteredResults[0]?.id ?? null);
    }
  }, [filteredResults, selectedResultId]);

  const selectedResult = filteredResults.find((result) => result.id === selectedResultId) ?? filteredResults[0] ?? null;
  const recentSearches = [
    "Transformer models using reinforcement learning",
    "Attention mechanism",
    "Low-resource Telugu NLP",
    "Medical image segmentation",
  ];

  const handleClear = () => {
    setFilters({ domain: "", year: "", author: "", minSimilarity: "0" });
    onClear();
  };

  return (
    <div className={cn("w-full", className)}>
      <SearchToolbar
        query={query}
        loading={loading}
        recentSearches={recentSearches}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
        onClear={handleClear}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <SearchFilters
          domainOptions={domainOptions}
          yearOptions={yearOptions}
          authorOptions={authorOptions}
          values={filters}
          onChange={setFilters}
        />

        <section className="min-w-0">
          {loading ? (
            <SearchSkeleton />
          ) : error ? (
            <div className="rounded-large border border-danger/20 bg-danger/5 p-6 shadow-card">
              <h3 className="text-body font-semibold text-danger">Search could not be completed</h3>
              <p className="mt-2 text-small leading-6 text-text-secondary">{error}</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="rounded-large border border-dashed border-border bg-surface/80 p-8 text-center shadow-card">
              <h3 className="text-heading-m font-semibold text-text-primary">No results yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-small leading-6 text-text-secondary">
                Search for a concept such as “Transformer models using reinforcement learning” to retrieve relevant passages from the indexed library.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  selected={selectedResult?.id === result.id}
                  onSelect={() => setSelectedResultId(result.id)}
                  onOpenAnalysis={onOpenAnalysis}
                />
              ))}
            </div>
          )}
        </section>

        <SearchPreview result={selectedResult} />
      </div>
    </div>
  );
}
