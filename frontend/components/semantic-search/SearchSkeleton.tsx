import * as React from "react";

export function SearchSkeleton(): JSX.Element {
  return (
    <div className="mt-6 space-y-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="rounded-large border border-border bg-surface p-4 shadow-card">
          <div className="h-4 w-40 animate-pulse rounded bg-surface-hover" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-surface-hover" />
          <div className="mt-2 h-3 w-5/6 animate-pulse rounded bg-surface-hover" />
        </div>
      ))}
    </div>
  );
}
