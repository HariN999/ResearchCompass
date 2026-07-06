import * as React from "react";
import { SelectedFileCard } from "./SelectedFileCard";
import { cn } from "../../lib/utils";

export interface FileWithError {
  file: File;
  error?: string;
}

export interface SelectedFileListProps {
  files: FileWithError[];
  onRemove: (index: number) => void;
  className?: string;
}

export function SelectedFileList({
  files,
  onRemove,
  className,
}: SelectedFileListProps): JSX.Element {
  if (files.length === 0) return <></>;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-small font-semibold text-text-secondary text-left">
        {files.length} file{files.length !== 1 ? "s" : ""} selected
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {files.map((item, index) => (
          <SelectedFileCard
            key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`}
            file={item.file}
            error={item.error}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </div>
  );
}
