from __future__ import annotations

import logging
from typing import Any

from exceptions import VectorStoreError
from models import DocumentChunk, DocumentIngestionResult, RetrievedChunk
from services.embedding_service import EmbeddingService

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Stores and retrieves chunk embeddings from ChromaDB."""

    def __init__(
        self,
        embedding_service: EmbeddingService,
        *,
        persist_directory: str = "./chroma",
        collection_name: str = "research_documents",
        client: Any | None = None,
    ) -> None:
        self._embedding_service = embedding_service
        self._persist_directory = persist_directory
        self._collection_name = collection_name
        self._client = client
        self._collection: Any | None = None

    def index_document(self, ingestion_result: DocumentIngestionResult) -> None:
        chunks = ingestion_result.chunks
        if not chunks:
            return

        doc_id = ingestion_result.metadata.document_id
        logger.info("Vector indexing: Start indexing document %s with %d chunks", doc_id, len(chunks))
        try:
            collection = self._get_collection()
            embeddings = self._embedding_service.embed_documents([chunk.text for chunk in chunks])
            ids = [self._chunk_id(doc_id, chunk) for chunk in chunks]
            metadatas = [
                self._chunk_metadata(ingestion_result=ingestion_result, chunk=chunk) for chunk in chunks
            ]

            collection.upsert(
                ids=ids,
                documents=[chunk.text for chunk in chunks],
                embeddings=embeddings,
                metadatas=metadatas,
            )
            logger.info("Vector indexing: Successfully indexed %d chunks for document %s", len(chunks), doc_id)
        except Exception as exc:
            logger.error("Vector indexing failed for document %s: %s", doc_id, str(exc), exc_info=True)
            raise VectorStoreError(f"Failed to index document {doc_id} in vector store.") from exc

    def query(
        self,
        *,
        query_text: str,
        top_k: int = 5,
        document_id: str | None = None,
    ) -> list[RetrievedChunk]:
        if not query_text.strip():
            return []

        logger.info("Querying vector store. Query: '%s', top_k: %d, document_id: %s", query_text, top_k, document_id)
        try:
            collection = self._get_collection()
            query_embedding = self._embedding_service.embed_query(query_text)
            where = {"document_id": document_id} if document_id else None
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where,
            )
            return self._map_query_results(results)
        except Exception as exc:
            logger.error("Vector store query failed: %s", str(exc), exc_info=True)
            raise VectorStoreError("Vector store query failed.") from exc

    def _get_collection(self) -> Any:
        if self._collection is None:
            try:
                client = self._get_client()
                self._collection = client.get_or_create_collection(
                    name=self._collection_name,
                    metadata={"embedding_model": self._embedding_service.model_name},
                )
            except Exception as exc:
                if isinstance(exc, VectorStoreError):
                    raise
                logger.error("Failed to get or create ChromaDB collection: %s", str(exc), exc_info=True)
                raise VectorStoreError("Failed to access vector store collection.") from exc

        return self._collection

    def _get_client(self) -> Any:
        if self._client is None:
            logger.info("Initializing ChromaDB persistent client at: %s", self._persist_directory)
            try:
                import chromadb
            except ImportError as exc:
                logger.error("chromadb is not installed. Failed to import.", exc_info=True)
                raise VectorStoreError(
                    "chromadb is not installed. Run pip install chromadb."
                ) from exc
            try:
                self._client = chromadb.PersistentClient(path=self._persist_directory)
                logger.info("Successfully initialized ChromaDB client.")
            except Exception as exc:
                logger.error("Failed to initialize ChromaDB PersistentClient: %s", str(exc), exc_info=True)
                raise VectorStoreError("Failed to initialize vector database store client.") from exc

        return self._client

    def _map_query_results(self, results: dict[str, list[list[Any]]]) -> list[RetrievedChunk]:
        ids = results.get("ids", [[]])[0]
        documents = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]

        retrieved_chunks: list[RetrievedChunk] = []
        for result_id, document, distance, metadata in zip(ids, documents, distances, metadatas):
            metadata = metadata or {}
            retrieved_chunks.append(
                RetrievedChunk(
                    chunk_id=str(metadata.get("chunk_id") or result_id),
                    document_id=str(metadata.get("document_id") or ""),
                    text=document,
                    score=self._distance_to_score(distance),
                    page_start=int(metadata.get("page_start") or 1),
                    page_end=int(metadata.get("page_end") or 1),
                    page_numbers=self._page_numbers_from_metadata(metadata),
                    metadata=metadata,
                )
            )

        return retrieved_chunks

    def _chunk_id(self, document_id: str, chunk: DocumentChunk) -> str:
        return f"{document_id}:{chunk.chunk_id}"

    def _chunk_metadata(
        self,
        *,
        ingestion_result: DocumentIngestionResult,
        chunk: DocumentChunk,
    ) -> dict[str, str | int | float | bool]:
        return {
            "document_id": ingestion_result.metadata.document_id,
            "file_name": ingestion_result.metadata.file_name,
            "chunk_id": chunk.chunk_id,
            "chunk_index": chunk.chunk_index,
            "page_start": chunk.page_start,
            "page_end": chunk.page_end,
            "page_numbers": ",".join(str(page_number) for page_number in chunk.page_numbers),
            "char_count": chunk.char_count,
            "word_count": chunk.word_count,
        }

    def _page_numbers_from_metadata(
        self,
        metadata: dict[str, str | int | float | bool | None],
    ) -> list[int]:
        page_numbers = metadata.get("page_numbers")
        if isinstance(page_numbers, str) and page_numbers.strip():
            return [int(page_number) for page_number in page_numbers.split(",")]

        page_start = int(metadata.get("page_start") or 1)
        page_end = int(metadata.get("page_end") or page_start)
        return list(range(page_start, page_end + 1))

    def _distance_to_score(self, distance: Any) -> float:
        if distance is None:
            return 0.0

        try:
            numeric_distance = float(distance)
        except (TypeError, ValueError):
            return 0.0

        return 1.0 / (1.0 + max(numeric_distance, 0.0))
