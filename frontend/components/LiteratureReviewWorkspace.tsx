"use client";

import { useEffect, useState } from "react";

import { generateLiteratureReview, getIndexedDocuments } from "../lib/api";
import type { LibraryDocument, LiteratureReviewResponse } from "../types/analysis";

export function LiteratureReviewWorkspace(): JSX.Element {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<LiteratureReviewResponse | null>(null);

  useEffect(() => {
    void loadDocuments();
  }, []);

  async function loadDocuments(): Promise<void> {
    setIsLoadingDocuments(true);
    setError(null);

    try {
      const indexedDocuments = await getIndexedDocuments();
      setDocuments(indexedDocuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load indexed documents.");
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  function toggleSelection(documentId: string): void {
    setSelectedIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    );
  }

  async function handleGenerateReview(): Promise<void> {
    if (selectedIds.length < 2) {
      setError("Select at least two indexed documents to generate a literature review.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setReview(null);

    try {
      const nextReview = await generateLiteratureReview(selectedIds);
      setReview(nextReview);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate the literature review.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
            Literature Review Workspace
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Synthesize a review from your indexed papers
          </h2>
          <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
            Use the local document corpus to create a structured literature review grounded in the papers you have already ingested.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Indexed documents</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{documents.length} available</span>
            </div>

            {isLoadingDocuments ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading indexed documents…</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No indexed documents are available yet. Upload a paper from the analysis workspace to seed this review.
              </p>
            ) : (
              <ul className="space-y-2">
                {documents.map((document) => {
                  const isSelected = selectedIds.includes(document.id);
                  return (
                    <li key={document.id}>
                      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-600 transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-800 dark:bg-gray-950/70 dark:text-gray-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(document.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="min-w-0">
                          <span className="block font-medium text-gray-900 dark:text-white">{document.title}</span>
                          <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                            {document.authors || "Unknown author"} • {document.domain || "Unclassified"}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950/60">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Review controls</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Select at least two documents to synthesize a review with themes, trends, limitations, and future directions.
            </p>

            <button
              type="button"
              onClick={() => {
                void handleGenerateReview();
              }}
              disabled={isGenerating || selectedIds.length < 2}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:disabled:bg-indigo-900"
            >
              {isGenerating ? "Generating review…" : "Generate literature review"}
            </button>

            <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300">
              <p className="font-medium text-gray-900 dark:text-white">Selected papers</p>
              <p className="mt-1">{selectedIds.length} selected</p>
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {review ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400">
                Generated review
              </p>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Synthesis overview
              </h3>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              { title: "Overview", content: review.overview },
              { title: "Major themes", content: review.major_themes },
              { title: "Methodology trends", content: review.methodology_trends },
              { title: "Strengths", content: review.strengths },
              { title: "Limitations", content: review.limitations },
              { title: "Research trends", content: review.research_trends },
              { title: "Open challenges", content: review.open_challenges },
              { title: "Future directions", content: review.future_directions },
            ].map((section) => (
              <div key={section.title} className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{section.title}</h4>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{section.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Full literature review</h4>
            <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-600 dark:text-gray-300">
              {review.generated_literature_review}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
