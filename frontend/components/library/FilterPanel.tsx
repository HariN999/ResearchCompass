import * as React from "react";
import { Filter } from "lucide-react";
import { cn } from "../../lib/utils";
import type { LibraryFilters } from "./library-types";
import { DOMAINS, YEARS } from "./library-types";

export interface FilterPanelProps {
  filters: LibraryFilters;
  onChange: (filters: LibraryFilters) => void;
  className?: string;
}

export function FilterPanel({ filters, onChange, className }: FilterPanelProps): JSX.Element {
  const selectClass =
    "rounded-medium border border-border bg-surface px-3 py-2 text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors cursor-pointer";

  const hasActive = filters.domain !== "" || filters.year !== "" || filters.author !== "";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="flex items-center gap-1.5 text-text-secondary">
        <Filter className="h-4 w-4" />
        <span className="text-small font-medium select-none">Filters</span>
      </div>

      <select
        value={filters.domain}
        onChange={(e) => onChange({ ...filters, domain: e.target.value === "All Domains" ? "" : e.target.value })}
        className={selectClass}
        aria-label="Filter by domain"
      >
        {DOMAINS.map((d) => (
          <option key={d} value={d === "All Domains" ? "" : d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={filters.year}
        onChange={(e) => onChange({ ...filters, year: e.target.value === "All Years" ? "" : e.target.value })}
        className={selectClass}
        aria-label="Filter by year"
      >
        {YEARS.map((y) => (
          <option key={y} value={y === "All Years" ? "" : y}>
            {y}
          </option>
        ))}
      </select>

      {hasActive && (
        <button
          type="button"
          onClick={() => onChange({ ...filters, domain: "", year: "", author: "" })}
          className="text-caption text-primary font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-small px-1"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
