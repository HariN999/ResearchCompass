"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";

interface UploadSectionProps {
  onAnalyze: (file: File) => void;
  loading: boolean;
}

export function UploadSection({ onAnalyze, loading }: UploadSectionProps): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function selectFile(file: File): void {
    setSelectedFile(file);
  }

  function runAnalysis(): void {
    if (selectedFile && !loading) {
      onAnalyze(selectedFile);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <div
        className={`cursor-pointer rounded-2xl p-10 transition-all duration-300 glass-card relative overflow-hidden group ${
          isDragging
            ? "border-accent/40 bg-accent/5 shadow-[0_0_25px_rgba(0,242,254,0.15)]"
            : "hover:border-accent/20 hover:shadow-[0_0_20px_rgba(0,242,254,0.05)]"
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
          accept=".pdf,.tex,.docx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.item(0);
            if (file) {
              selectFile(file);
            }
          }}
        />

        {/* Ambient background glow */}
        <div className="absolute -inset-px bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* Levitating Upload Icon container */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/5 bg-white/[0.02] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] animate-levitate transition-all duration-300 group-hover:border-accent/30 group-hover:shadow-[0_0_15px_rgba(0,242,254,0.1)]">
            <UploadCloud className="h-6 w-6 text-text-secondary group-hover:text-accent transition-colors duration-300" />
          </div>

          <p className="mt-5 text-sm font-semibold text-text-primary tracking-wide">
            Drop your manuscript here
          </p>
          <p className="mt-1.5 text-xs text-text-muted">
            Supports .pdf, .tex, .docx
          </p>

          {selectedFile ? (
            <div className="mt-6 flex justify-center">
              <div
                className="flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs text-accent shadow-[0_0_10px_rgba(0,242,254,0.05)]"
                onClick={(event) => event.stopPropagation()}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="truncate max-w-[200px] font-mono">{selectedFile.name}</span>
                <button
                  type="button"
                  className="ml-1 text-accent/60 hover:text-accent font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  aria-label="Clear selected file"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <button
                type="button"
                className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-1.5 text-xs font-semibold text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-200 shadow-sm hover:shadow-[0_0_10px_rgba(0,242,254,0.1)]"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Select File
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="flex justify-center animate-fadeIn">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-background transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,242,254,0.3)] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-text-muted disabled:border disabled:border-white/5 disabled:shadow-none font-sans"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/25 border-t-background" aria-hidden="true" />
            )}
            {loading ? "Analyzing Manuscript..." : "Run Analysis"}
          </button>
        </div>
      )}
    </div>
  );
}
