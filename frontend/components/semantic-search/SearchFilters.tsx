import * as React from "react";
import { Sparkles } from "lucide-react";

export interface SearchFiltersProps {
  domainOptions: string[];
  yearOptions: string[];
  authorOptions: string[];
  values: {
    domain: string;
    year: string;
    author: string;
    minSimilarity: string;
  };
  onChange: (values: { domain: string; year: string; author: string; minSimilarity: string }) => void;
}

export function SearchFilters({ domainOptions, yearOptions, authorOptions, values, onChange }: SearchFiltersProps): JSX.Element {
  return (
    <aside className="rounded-large border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-body font-semibold text-text-primary">Search filters</h3>
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="domain-filter">
            Research domain
          </label>
          <select
            id="domain-filter"
            value={values.domain}
            onChange={(event) => onChange({ ...values, domain: event.target.value })}
            className="w-full rounded-medium border border-border bg-background/60 px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All domains</option>
            {domainOptions.map((domain) => (
              <option key={domain} value={domain}>
                {domain}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="year-filter">
            Publication year
          </label>
          <select
            id="year-filter"
            value={values.year}
            onChange={(event) => onChange({ ...values, year: event.target.value })}
            className="w-full rounded-medium border border-border bg-background/60 px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="author-filter">
            Author
          </label>
          <select
            id="author-filter"
            value={values.author}
            onChange={(event) => onChange({ ...values, author: event.target.value })}
            className="w-full rounded-medium border border-border bg-background/60 px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All authors</option>
            {authorOptions.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-caption font-semibold uppercase tracking-wide text-text-muted" htmlFor="similarity-filter">
            Minimum similarity
          </label>
          <select
            id="similarity-filter"
            value={values.minSimilarity}
            onChange={(event) => onChange({ ...values, minSimilarity: event.target.value })}
            className="w-full rounded-medium border border-border bg-background/60 px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="0">Any similarity</option>
            <option value="0.65">65%+</option>
            <option value="0.75">75%+</option>
            <option value="0.85">85%+</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
