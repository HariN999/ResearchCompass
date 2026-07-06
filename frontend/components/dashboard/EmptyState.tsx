import * as React from "react";
import { BookOpen, Upload } from "lucide-react";
import { Button } from "../ui/Button";

export interface EmptyStateProps {
  onActionClick: () => void;
  title?: string;
  description?: string;
  actionText?: string;
}

export function EmptyState({
  onActionClick,
  title = "No manuscripts indexed yet",
  description = "Get started by uploading PDFs to your research library. Our section-aware chunker and semantic vector indexer will prepare them for multi-document RAG comparison and reviews.",
  actionText = "Upload First Paper",
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-large bg-surface/50 max-w-xl mx-auto my-8 select-none">
      <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <BookOpen className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-heading-m font-bold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-body text-text-secondary max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      <Button onClick={onActionClick} className="flex items-center gap-2">
        <Upload className="h-4 w-4" /> {actionText}
      </Button>
    </div>
  );
}
