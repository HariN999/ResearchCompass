from __future__ import annotations

import logging

from models import DocumentIngestionResult, RetrievedChunk
from services.vector_store_service import VectorStoreService

logger = logging.getLogger(__name__)


class RetrievalService:
    """Coordinates indexing and semantic retrieval over ingested documents."""

    def __init__(self, vector_store_service: VectorStoreService, top_k: int = 5) -> None:
        if top_k <= 0:
            logger.error("Initialization failed: top_k must be positive, got %d", top_k)
            raise ValueError("top_k must be positive")

        self._vector_store_service = vector_store_service
        self._top_k = top_k

    def index_document(self, ingestion_result: DocumentIngestionResult) -> None:
        logger.info("Coordinating index document request for document %s", ingestion_result.metadata.document_id)
        self._vector_store_service.index_document(ingestion_result)

    def retrieve(
        self,
        *,
        query_text: str,
        top_k: int | None = None,
        document_id: str | None = None,
    ) -> list[RetrievedChunk]:
        limit = top_k or self._top_k
        logger.info("Coordinating retrieval query for document %s (top_k=%d)", document_id, limit)
        return self._vector_store_service.query(
            query_text=query_text,
            top_k=limit,
            document_id=document_id,
        )

