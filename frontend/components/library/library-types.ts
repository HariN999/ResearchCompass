/**
 * Frontend type definitions for the Research Library.
 * Mirrors backend DocumentMetadata fields relevant to the UI.
 */

export interface LibraryDocument {
  id: string;
  title: string;
  authors: string;
  domain: string;
  year: number | null;
  uploadDate: string;
  pageCount: number;
  wordCount: number;
  chunkCount: number;
  status: "indexed" | "processing" | "failed";
  tags: string[];
  fileName: string;
  fileSizeBytes: number;
}

export type ViewMode = "grid" | "table";

export type SortField = "title" | "uploadDate" | "year" | "pageCount";
export type SortDirection = "asc" | "desc";

export interface LibraryFilters {
  search: string;
  domain: string;
  year: string;
  author: string;
}

/**
 * Placeholder documents for development.
 * Will be replaced by API calls to a backend listing endpoint.
 */
export const PLACEHOLDER_DOCUMENTS: LibraryDocument[] = [
  {
    id: "doc-1",
    title: "Attention Is All You Need",
    authors: "Vaswani, Shazeer, Parmar et al.",
    domain: "Natural Language Processing",
    year: 2017,
    uploadDate: "2025-07-04",
    pageCount: 15,
    wordCount: 9842,
    chunkCount: 24,
    status: "indexed",
    tags: ["Transformers", "Self-Attention", "NLP"],
    fileName: "attention-is-all-you-need.pdf",
    fileSizeBytes: 2_400_000,
  },
  {
    id: "doc-2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: "Devlin, Chang, Lee, Toutanova",
    domain: "Natural Language Processing",
    year: 2019,
    uploadDate: "2025-07-04",
    pageCount: 16,
    wordCount: 11_230,
    chunkCount: 28,
    status: "indexed",
    tags: ["BERT", "Pre-training", "NLP"],
    fileName: "bert-pretraining.pdf",
    fileSizeBytes: 3_100_000,
  },
  {
    id: "doc-3",
    title: "Scaling Laws for Neural Language Models",
    authors: "Kaplan, McCandlish, Henighan et al.",
    domain: "Machine Learning",
    year: 2020,
    uploadDate: "2025-07-05",
    pageCount: 22,
    wordCount: 14_520,
    chunkCount: 35,
    status: "indexed",
    tags: ["Scaling Laws", "LLM", "Compute"],
    fileName: "scaling-laws.pdf",
    fileSizeBytes: 4_200_000,
  },
  {
    id: "doc-4",
    title: "Sparse Attention Mechanisms for Long Sequences",
    authors: "Child, Gray, Radford, Sutskever",
    domain: "Deep Learning",
    year: 2019,
    uploadDate: "2025-07-05",
    pageCount: 18,
    wordCount: 10_100,
    chunkCount: 22,
    status: "indexed",
    tags: ["Sparse Attention", "Efficiency", "Transformers"],
    fileName: "sparse-attention.pdf",
    fileSizeBytes: 2_800_000,
  },
  {
    id: "doc-5",
    title: "An Image is Worth 16x16 Words: Vision Transformers",
    authors: "Dosovitskiy, Beyer, Kolesnikov et al.",
    domain: "Computer Vision",
    year: 2021,
    uploadDate: "2025-07-06",
    pageCount: 22,
    wordCount: 13_400,
    chunkCount: 30,
    status: "indexed",
    tags: ["ViT", "Vision", "Transformers"],
    fileName: "vision-transformers.pdf",
    fileSizeBytes: 5_600_000,
  },
  {
    id: "doc-6",
    title: "Retrieval-Augmented Generation for NLP Tasks",
    authors: "Lewis, Perez, Piktus et al.",
    domain: "Natural Language Processing",
    year: 2020,
    uploadDate: "2025-07-06",
    pageCount: 12,
    wordCount: 8_200,
    chunkCount: 18,
    status: "indexed",
    tags: ["RAG", "Retrieval", "Generation"],
    fileName: "rag-for-nlp.pdf",
    fileSizeBytes: 1_900_000,
  },
];

export const DOMAINS = [
  "All Domains",
  "Natural Language Processing",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "Reinforcement Learning",
];

export const YEARS = [
  "All Years",
  "2025",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
  "2017",
];
