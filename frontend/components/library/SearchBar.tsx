import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search papers by title, author, or keyword…", className }: SearchBarProps): JSX.Element {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-medium border border-border bg-surface pl-10 pr-4 py-2.5 text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
        aria-label="Search documents"
      />
    </div>
  );
}
