/**
 * Queue state model for upload processing pipeline.
 * Designed for future integration with backend progress events (SSE/WebSocket).
 */

export const UPLOAD_STAGES = [
  "queued",
  "uploading",
  "validating",
  "extracting",
  "chunking",
  "embedding",
  "indexing",
  "completed",
  "failed",
] as const;

export type UploadStage = (typeof UPLOAD_STAGES)[number];

export const STAGE_LABELS: Record<UploadStage, string> = {
  queued: "Queued",
  uploading: "Uploading",
  validating: "Validating PDF",
  extracting: "Extracting Text",
  chunking: "Chunking Sections",
  embedding: "Generating Embeddings",
  indexing: "Indexing Vectors",
  completed: "Completed",
  failed: "Failed",
};

/** Ordered processing stages (excludes terminal states). */
export const PROCESSING_STAGES: UploadStage[] = [
  "queued",
  "uploading",
  "validating",
  "extracting",
  "chunking",
  "embedding",
  "indexing",
];

export function getStageProgress(stage: UploadStage): number {
  if (stage === "completed") return 100;
  if (stage === "failed") return 0;
  const index = PROCESSING_STAGES.indexOf(stage);
  if (index < 0) return 0;
  return Math.round((index / (PROCESSING_STAGES.length - 1)) * 100);
}

export interface QueueItem {
  id: string;
  fileName: string;
  fileSize: number;
  stage: UploadStage;
  error?: string;
  documentId?: string;
  addedAt: number;
}
