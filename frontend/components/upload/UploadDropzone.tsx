"use client";

import * as React from "react";
import { useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "../../lib/utils";

export interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadDropzone({
  onFilesSelected,
  disabled = false,
  className,
}: UploadDropzoneProps): JSX.Element {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateAndEmit = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles = files.filter(
        (f) =>
          (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) &&
          f.size <= MAX_FILE_SIZE_BYTES
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (!disabled && e.dataTransfer.files.length > 0) {
        validateAndEmit(e.dataTransfer.files);
      }
    },
    [disabled, validateAndEmit]
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        validateAndEmit(e.target.files);
        e.target.value = "";
      }
    },
    [validateAndEmit]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload PDF files. Click or drag and drop."
      className={cn(
        "group relative flex flex-col items-center justify-center rounded-large border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer select-none",
        isDragOver && !disabled
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border bg-surface hover:border-primary/40 hover:bg-surface-hover",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
        aria-hidden="true"
      />

      <div
        className={cn(
          "h-12 w-12 flex items-center justify-center rounded-full mb-4 transition-colors",
          isDragOver && !disabled
            ? "bg-primary/15 text-primary"
            : "bg-surface-hover text-text-secondary group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        <Upload className="h-6 w-6" />
      </div>

      <p className="text-heading-m font-semibold text-text-primary mb-1">
        {isDragOver ? "Drop your PDFs here" : "Drop PDFs here or click to browse"}
      </p>
      <p className="text-small text-text-muted">
        Accepts <span className="font-medium text-text-secondary">.pdf</span> files up to {MAX_FILE_SIZE_MB}MB each
      </p>
    </div>
  );
}
