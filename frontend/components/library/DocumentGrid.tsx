import * as React from "react";
import { DocumentCard } from "./DocumentCard";
import { cn } from "../../lib/utils";
import type { LibraryDocument } from "./library-types";

export interface DocumentGridProps {
  documents: LibraryDocument[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onAction: (action: string, id: string) => void;
  className?: string;
}

export function DocumentGrid({
  documents,
  selectedIds,
  onSelect,
  onAction,
  className,
}: DocumentGridProps): JSX.Element {
  return (
    <div className={cn("grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          selected={selectedIds.has(doc.id)}
          onSelect={onSelect}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
