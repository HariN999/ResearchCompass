import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "../ui/Button";

export interface SearchToolbarProps {
  query: string;
  loading: boolean;
  recentSearches: string[];
  onQueryChange: (value: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
}

export function SearchToolbar({ query, loading, recentSearches, onQueryChange, onSearch, onClear }: SearchToolbarProps): JSX.Element {
  const [draftQuery, setDraftQuery] = React.useState(query);

  React.useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = draftQuery.trim();
    if (!trimmedQuery) {
      return;
    }
    onQueryChange(trimmedQuery);
    onSearch(trimmedQuery);
  };

  return (
    <div className="rounded-large border border-border bg-surface p-4 shadow-card sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">Semantic Search</p>
          <h2 className="mt-1 text-heading-m font-semibold text-text-primary">Search across the indexed research library</h2>
          <p className="mt-2 max-w-2xl text-small leading-6 text-text-secondary">
            Ask natural-language questions and discover the most relevant chunks across your indexed papers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="recent-searches">
            Recent searches
          </label>
          <select
            id="recent-searches"
            className="rounded-medium border border-border bg-background/60 px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            value=""
            onChange={(event) => {
              const value = event.target.value;
              if (value) {
                setDraftQuery(value);
                onQueryChange(value);
                onSearch(value);
              }
            }}
          >
            <option value="">Recent searches</option>
            {recentSearches.map((search) => (
              <option key={search} value={search}>
                {search}
              </option>
            ))}
          </select>
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <RotateCcw className="mr-2 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </div>

      <form className="mt-5 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="semantic-search-input">
          Search the research library
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input
            id="semantic-search-input"
            className="h-11 w-full rounded-medium border border-border bg-background/70 pl-10 pr-4 text-small text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Try: Transformer models using reinforcement learning"
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            autoComplete="off"
          />
        </div>
        <Button type="submit" className="md:min-w-[140px]" disabled={loading || !draftQuery.trim()}>
          <Search className="mr-2 h-3.5 w-3.5" /> Search
        </Button>
      </form>
    </div>
  );
}
