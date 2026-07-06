import * as React from "react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/utils";
import type { LibraryDocument } from "./library-types";

export interface DocumentTableProps {
  documents: LibraryDocument[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onAction: (action: string, id: string) => void;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentTable({
  documents,
  selectedIds,
  onSelect,
  onSelectAll,
  onAction,
  className,
}: DocumentTableProps): JSX.Element {
  const allSelected = documents.length > 0 && documents.every((d) => selectedIds.has(d.id));

  return (
    <div className={cn("overflow-x-auto rounded-large border border-border", className)}>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-surface-hover">
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="rounded border-border accent-primary cursor-pointer"
                aria-label="Select all documents"
              />
            </th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">Title</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Authors</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Domain</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Year</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Pages</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider hidden xl:table-cell">Size</th>
            <th className="px-4 py-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr
              key={doc.id}
              className={cn(
                "transition-colors cursor-pointer",
                selectedIds.has(doc.id)
                  ? "bg-primary/5"
                  : "hover:bg-surface-hover"
              )}
              onClick={() => onSelect(doc.id)}
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(doc.id)}
                  onChange={() => onSelect(doc.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-border accent-primary cursor-pointer"
                  aria-label={`Select ${doc.title}`}
                />
              </td>
              <td className="px-4 py-3">
                <p className="text-body font-medium text-text-primary truncate max-w-[280px]">{doc.title}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <p className="text-small text-text-secondary truncate max-w-[200px]">{doc.authors}</p>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-small text-text-secondary">{doc.domain}</span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-small text-text-muted">{doc.year ?? "—"}</span>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-small text-text-muted">{doc.pageCount}</span>
              </td>
              <td className="px-4 py-3 hidden xl:table-cell">
                <span className="text-small text-text-muted">{formatSize(doc.fileSizeBytes)}</span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={doc.status === "indexed" ? "success" : doc.status === "processing" ? "primary" : "danger"} className="text-[10px]">
                  {doc.status === "indexed" ? "Indexed" : doc.status === "processing" ? "Processing" : "Failed"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
