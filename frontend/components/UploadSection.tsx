"use client";

import { useRef, useState } from "react";

interface UploadSectionProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
}

export function UploadSection({ onAnalyze, loading }: UploadSectionProps): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function selectFile(file: File): void {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(file);
    }
  }

  function runAnalysis(): void {
    if (selectedFile && !loading) {
      onAnalyze(selectedFile);
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

          const file = event.dataTransfer.files.item(0);
          if (file) {
            selectFile(file);
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.item(0);
            if (file) {
              selectFile(file);
            }
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

        <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Drop your PDF here</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Click or drag to upload a research paper</p>

        {selectedFile ? (
          <div className="mt-5 flex justify-center">
            <div
              className="flex max-w-full items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
              onClick={(event) => event.stopPropagation()}
            >
              <span className="truncate">{selectedFile.name}</span>
              <button
                type="button"
                className="text-gray-400 transition-all duration-150 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white"
                onClick={() => setSelectedFile(null)}
                aria-label="Clear selected file"
              >
                x
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={runAnalysis}
          disabled={!selectedFile || loading}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-all duration-150 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:border disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:border-gray-800 dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" aria-hidden="true" />
          ) : null}
          {loading ? "Analyzing" : selectedFile ? "Run Analysis" : "Select a PDF"}
        </button>
      </div>
    </div>
  );
}
