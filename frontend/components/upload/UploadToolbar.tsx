import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

export interface UploadToolbarProps {
  fileCount: number;
  validCount: number;
  onClearAll: () => void;
  onUpload: () => void;
  isUploading?: boolean;
  className?: string;
}

export function UploadToolbar({
  fileCount,
  validCount,
  onClearAll,
  onUpload,
  isUploading = false,
  className,
}: UploadToolbarProps): JSX.Element {
  if (fileCount === 0) return <></>;

  const hasValid = validCount > 0;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 rounded-medium border border-border bg-surface p-4",
        className
      )}
    >
      <div className="text-left">
        <p className="text-body font-medium text-text-primary">
          {validCount} of {fileCount} file{fileCount !== 1 ? "s" : ""} ready
        </p>
        {validCount < fileCount && (
          <p className="text-caption text-danger">
            {fileCount - validCount} file{fileCount - validCount !== 1 ? "s" : ""} have validation errors
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={isUploading}
          className="flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear All
        </Button>
        <Button
          onClick={onUpload}
          disabled={!hasValid || isUploading}
          isLoading={isUploading}
          className="flex items-center gap-2"
        >
          Upload {validCount} File{validCount !== 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
