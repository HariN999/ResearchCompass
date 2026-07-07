"use client";

import { useRef, useState } from "react";

interface UploadSectionProps {
  onAnalyze: (files: File[]) => void;
  loading: boolean;
}

export function UploadSection({ onAnalyze, loading }: UploadSectionProps): JSX.Element {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function addFiles(files: FileList | null): void {
    if (!files) return;
    const pdfs: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))) {
        if (!selectedFiles.some((f) => f.name === file.name && f.size === file.size)) {
          pdfs.push(file);
        }
      }
    }
    if (pdfs.length > 0) {
      setSelectedFiles((prev) => [...prev, ...pdfs]);
    }
  }

  function removeFile(index: number, event: React.MouseEvent): void {
    event.stopPropagation();
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function runAnalysis(): void {
    if (selectedFiles.length > 0 && !loading) {
      onAnalyze(selectedFiles);
    }
  }

  return (
    <div className="mt-10">
      <div
        className={`cursor-pointer rounded-lg border border-dashed p-8 transition-all duration-150 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-gray-900"
            : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
        }`}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(event) => {
            addFiles(event.target.files);
          }}
        />

        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800">
          <svg
            className="h-5 w-5 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 16V5m0 0 4 4m-4-4L8 9M5 19h14" />
          </svg>
        </div>

        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Drop your PDF(s) here</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Click or drag to upload one or more research papers</p>

        {selectedFiles.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                onClick={(event) => event.stopPropagation()}
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white font-bold"
                  onClick={(event) => removeFile(idx, event)}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={selectedFiles.length === 0 || loading}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:border-gray-800 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" aria-hidden="true" />
          ) : null}
          {loading
            ? "Analyzing..."
            : selectedFiles.length > 0
            ? `Run Analysis (${selectedFiles.length} Paper${selectedFiles.length > 1 ? "s" : ""})`
            : "Select PDF(s)"}
        </button>
      </div>
    </div>
  );
}
