from __future__ import annotations

import logging
from typing import Any

from models import DocumentIngestionResult, RetrievedChunk
from services.vector_store_service import VectorStoreService

logger = logging.getLogger(__name__)


class RetrievalService:
    """Coordinates indexing and semantic retrieval over ingested documents."""

    DEFAULT_RETRIEVAL_STRATEGY = [
        {
            "stage": "Overview",
            "query": "abstract introduction problem statement research domain",
            "top_k": 3,
            "priority": 1,
        },
        {
            "stage": "Methodology",
            "query": "methodology methods architecture training datasets evaluation metrics",
            "top_k": 3,
            "priority": 2,
        },
        {
            "stage": "Evaluation",
            "query": "experiments results baselines comparison weaknesses research gaps limitations",
            "top_k": 3,
            "priority": 3,
        },
        {
            "stage": "Conclusion",
            "query": "conclusion discussion future work recommendations viva questions contributions",
            "top_k": 2,
            "priority": 4,
        },
    ]

    def __init__(
        self,
        vector_store_service: VectorStoreService,
        top_k: int = 5,
        retrieval_strategy: list[dict[str, Any]] | None = None,
    ) -> None:
        if top_k <= 0:
            logger.error("Initialization failed: top_k must be positive, got %d", top_k)
            raise ValueError("top_k must be positive")

        self._vector_store_service = vector_store_service
        self._top_k = top_k
        self._retrieval_strategy = retrieval_strategy or self.DEFAULT_RETRIEVAL_STRATEGY

    def index_document(self, ingestion_result: DocumentIngestionResult) -> None:
        logger.info("Coordinating index document request for document %s", ingestion_result.metadata.document_id)
        self._vector_store_service.index_document(ingestion_result)

    def retrieve(
        self,
        *,
        query_text: str,
        top_k: int | None = None,
        document_id: str | None = None,
        document_ids: list[str] | None = None,
    ) -> list[RetrievedChunk]:
        limit = top_k or self._top_k
        logger.info("Coordinating retrieval query for document %s, document_ids %s (top_k=%d)", document_id, document_ids, limit)
        return self._vector_store_service.query(
            query_text=query_text,
            top_k=limit,
            document_id=document_id,
            document_ids=document_ids,
        )

    def retrieve_for_analysis(
        self,
        *,
        document_id: str,
    ) -> list[RetrievedChunk]:
        logger.info("Executing section-aware targeted retrieval for document %s", document_id)
        
        # Sort strategy by priority
        strategy = sorted(self._retrieval_strategy, key=lambda s: s.get("priority", 99))
        
        all_chunks: list[RetrievedChunk] = []
        for stage in strategy:
            query = stage["query"]
            limit = stage["top_k"]
            logger.info("Running retrieval stage '%s': query='%s', top_k=%d", stage["stage"], query, limit)
            chunks = self.retrieve(
                query_text=query,
                top_k=limit,
                document_id=document_id,
            )
            all_chunks.extend(chunks)
            
        # Deduplicate and preserve original chunk index order
        seen_ids = set()
        deduplicated: list[RetrievedChunk] = []
        for chunk in all_chunks:
            if chunk.chunk_id not in seen_ids:
                seen_ids.add(chunk.chunk_id)
                deduplicated.append(chunk)
                
        def get_chunk_index(c: RetrievedChunk) -> int:
            idx = c.metadata.get("chunk_index")
            try:
                return int(idx) if idx is not None else 0
            except (TypeError, ValueError):
                return 0
                
        deduplicated.sort(key=get_chunk_index)
        logger.info("Retrieved %d unique chunks using targeted strategy for document %s", len(deduplicated), document_id)
        return deduplicated

    def search(
        self,
        query: str,
        top_k: int = 5,
        document_ids: list[str] | None = None,
    ) -> list[RetrievedChunk]:
        if not query or not query.strip():
            logger.warning("Empty or whitespace query rejected in search.")
            raise ValueError("Query string cannot be empty or whitespace-only.")
        if top_k <= 0:
            logger.warning("Invalid top_k=%d rejected in search.", top_k)
            raise ValueError("top_k must be a positive integer.")

        logger.info("Executing semantic similarity search for query (length: %d chars) with top_k: %d, document_ids: %s", len(query), top_k, document_ids)

        import time
        start_time = time.perf_counter()
        results = self._vector_store_service.query(
            query_text=query,
            top_k=top_k,
            document_id=None,
            document_ids=document_ids,
        )
        duration = time.perf_counter() - start_time
        logger.info("Semantic search completed in %.4f seconds. Results retrieved: %d", duration, len(results))
        return results

    def list_documents(self) -> list[dict[str, Any]]:
        logger.info("Retrieving all documents from VectorStore via RetrievalService")
        return self._vector_store_service.list_documents()


