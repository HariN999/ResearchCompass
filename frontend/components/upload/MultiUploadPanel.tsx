"use client";

import * as React from "react";
import { useCallback, useState, useRef } from "react";
import { UploadDropzone } from "./UploadDropzone";
import { SelectedFileList, type FileWithError } from "./SelectedFileList";
import { UploadToolbar } from "./UploadToolbar";
import { UploadQueue } from "./UploadQueue";
import { cn } from "../../lib/utils";
import type { QueueItem, UploadStage } from "./queue-types";
import { PROCESSING_STAGES } from "./queue-types";

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

let queueIdCounter = 0;

export function MultiUploadPanel({
  onUpload,
  onUploadComplete,
  className,
}: MultiUploadPanelProps): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<FileWithError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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

  const handleQueueRemove = useCallback((id: string) => {
    setQueueItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleQueueRetry = useCallback(
    (id: string) => {
      // Reset to queued and re-simulate (placeholder for future backend retry)
      setQueueItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stage: "queued" as UploadStage, error: undefined } : item
        )
      );
    },
    []
  );

  const updateQueueItemStage = useCallback(
    (id: string, stage: UploadStage, error?: string, documentId?: string) => {
      setQueueItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stage, error, documentId } : item
        )
      );
    },
    []
  );

  /**
   * Simulate pipeline stage progression for a single file.
   * In the future, replace this with real backend SSE/WebSocket events.
   */
  const simulateStageProgression = useCallback(
    (queueId: string, finalStage: UploadStage, error?: string, documentId?: string) => {
      const stages = PROCESSING_STAGES;
      const delay = 400; // ms per stage

      stages.forEach((stage, index) => {
        const timer = setTimeout(() => {
          // If final stage is "failed" and we've reached the last processing stage,
          // transition to failed instead
          if (finalStage === "failed" && index === stages.length - 1) {
            updateQueueItemStage(queueId, "failed", error);
            return;
          }
          updateQueueItemStage(queueId, stage);
        }, delay * (index + 1));
        stageTimersRef.current.push(timer);
      });

      // Final terminal state
      if (finalStage !== "failed") {
        const finalTimer = setTimeout(() => {
          updateQueueItemStage(queueId, "completed", undefined, documentId);
        }, delay * (stages.length + 1));
        stageTimersRef.current.push(finalTimer);
      }
    },
    [updateQueueItemStage]
  );

  const validFiles = selectedFiles.filter((f) => !f.error);

  const handleUpload = useCallback(async () => {
    if (validFiles.length === 0 || !onUpload) return;

    // Create queue items for each valid file
    const newItems: QueueItem[] = validFiles.map((f) => ({
      id: `queue-${++queueIdCounter}`,
      fileName: f.file.name,
      fileSize: f.file.size,
      stage: "queued" as UploadStage,
      addedAt: Date.now(),
    }));

    setQueueItems((prev) => [...prev, ...newItems]);
    setSelectedFiles([]);
    setIsUploading(true);

    try {
      const results = await onUpload(validFiles.map((f) => f.file));

      // Map results to queue items and simulate stage progression
      newItems.forEach((queueItem) => {
        const result = results.find((r) => r.file_name === queueItem.fileName);
        if (result) {
          simulateStageProgression(
            queueItem.id,
            result.status === "success" ? "completed" : "failed",
            result.error,
            result.document_id
          );
        } else {
          simulateStageProgression(queueItem.id, "failed", "No response from server");
        }
      });

      onUploadComplete?.(results);
    } catch (err) {
      // Mark all as failed
      newItems.forEach((queueItem) => {
        simulateStageProgression(
          queueItem.id,
          "failed",
          err instanceof Error ? err.message : "Upload failed"
        );
      });
    } finally {
      setIsUploading(false);
    }
  }, [validFiles, onUpload, onUploadComplete, simulateStageProgression]);

  // Cleanup timers on unmount
  React.useEffect(() => {
    return () => {
      stageTimersRef.current.forEach(clearTimeout);
    };
  }, []);

  const showQueue = queueItems.length > 0;

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
      {showQueue && (
        <UploadQueue
          items={queueItems}
          onRemove={handleQueueRemove}
          onRetry={handleQueueRetry}
        />
      )}
    </div>
  );
}
