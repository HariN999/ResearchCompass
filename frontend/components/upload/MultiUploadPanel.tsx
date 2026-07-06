"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { SelectedFileList, type FileWithError } from "./SelectedFileList";
import { UploadToolbar } from "./UploadToolbar";
import { cn } from "../../lib/utils";

const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export interface IngestionResult {
  file_name: string;
  status: "success" | "failed";
  document_id?: string;
  error?: string;
}

export interface MultiUploadPanelProps {
  /** Called when the user clicks upload with valid files. Return ingestion results. */
  onUpload?: (files: File[]) => Promise<IngestionResult[]>;
  /** Called after a successful upload completes */
  onUploadComplete?: (results: IngestionResult[]) => void;
  className?: string;
}

export function MultiUploadPanel({
  onUpload,
  onUploadComplete,
  className,
}: MultiUploadPanelProps): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<FileWithError[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback(
    (file: File, existingFiles: FileWithError[]): string | undefined => {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        return "Not a PDF file";
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return `Exceeds ${MAX_FILE_SIZE_MB}MB limit`;
      }
      const isDuplicate = existingFiles.some(
        (existing) =>
          existing.file.name === file.name &&
          existing.file.size === file.size &&
          existing.file.lastModified === file.lastModified
      );
      if (isDuplicate) {
        return "Duplicate file";
      }
      return undefined;
    },
    []
  );

  const handleFilesSelected = useCallback(
    (newFiles: File[]) => {
      setSelectedFiles((prev) => {
        const additions: FileWithError[] = [];
        let currentList = [...prev];

        for (const file of newFiles) {
          const error = validateFile(file, currentList);
          // Skip silently if it's an exact duplicate already in the list
          if (error === "Duplicate file") continue;
          const entry = { file, error };
          additions.push(entry);
          currentList.push(entry);
        }

        return [...prev, ...additions];
      });
    },
    [validateFile]
  );

  const handleRemove = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const validFiles = selectedFiles.filter((f) => !f.error);

  const handleUpload = useCallback(async () => {
    if (validFiles.length === 0 || !onUpload) return;

    setIsUploading(true);
    try {
      const results = await onUpload(validFiles.map((f) => f.file));
      onUploadComplete?.(results);
      // Remove successfully uploaded files from the list
      const successNames = new Set(
        results.filter((r) => r.status === "success").map((r) => r.file_name)
      );
      setSelectedFiles((prev) =>
        prev.filter((f) => !successNames.has(f.file.name))
      );
    } catch {
      // Error handling is delegated to the parent via onUpload rejection
    } finally {
      setIsUploading(false);
    }
  }, [validFiles, onUpload, onUploadComplete]);

  return (
    <div className={cn("space-y-5", className)}>
      <UploadDropzone
        onFilesSelected={handleFilesSelected}
        disabled={isUploading}
      />
      <SelectedFileList
        files={selectedFiles}
        onRemove={handleRemove}
      />
      <UploadToolbar
        fileCount={selectedFiles.length}
        validCount={validFiles.length}
        onClearAll={handleClearAll}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
