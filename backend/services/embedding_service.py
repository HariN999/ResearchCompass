from __future__ import annotations

import logging
from typing import Any

from exceptions import EmbeddingError

DEFAULT_EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Thin wrapper around SentenceTransformers for future retrieval workflows."""

    def __init__(
        self,
        model_name: str = DEFAULT_EMBEDDING_MODEL,
        model: Any | None = None,
    ) -> None:
        self._model_name = model_name
        self._model = model

    @property
    def model_name(self) -> str:
        return self._model_name

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        logger.info("Generating embeddings for %d texts using model %s", len(texts), self._model_name)
        try:
            model = self._get_model()
            embeddings = model.encode(
                texts,
                normalize_embeddings=True,
                convert_to_numpy=True,
            )
            logger.info("Successfully generated %d embeddings", len(texts))
            return embeddings.tolist()
        except Exception as exc:
            logger.error("Failed to generate embeddings: %s", str(exc), exc_info=True)
            raise EmbeddingError("Embedding generation failed.") from exc

    def embed_query(self, query: str) -> list[float]:
        if not query or not query.strip():
            logger.warning("Attempted to embed an empty or whitespace query.")
            raise EmbeddingError("The query text is empty.")

        logger.info("Generating embedding for search query")
        try:
            embeddings = self.embed_documents([query])
            if not embeddings:
                raise EmbeddingError("No embeddings returned for query.")
            return embeddings[0]
        except Exception as exc:
            if isinstance(exc, EmbeddingError):
                raise
            logger.error("Failed to generate query embedding: %s", str(exc), exc_info=True)
            raise EmbeddingError("Query embedding generation failed.") from exc

    def _get_model(self) -> Any:
        if self._model is None:
            logger.info("Loading SentenceTransformer model: %s", self._model_name)
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                logger.error(
                    "sentence-transformers package not found when trying to load model %s",
                    self._model_name,
                    exc_info=True,
                )
                raise EmbeddingError(
                    "sentence-transformers is not installed. Run pip install sentence-transformers."
                ) from exc
            try:
                self._model = SentenceTransformer(self._model_name)
                logger.info("Successfully loaded SentenceTransformer model %s", self._model_name)
                try:
                    import torch
                    torch.set_num_threads(1)
                    logger.info("Successfully set PyTorch CPU thread count to 1 for optimized container execution.")
                except Exception as torch_exc:
                    logger.warning("Failed to configure PyTorch thread count: %s", str(torch_exc))
            except Exception as exc:
                logger.error("Failed to load SentenceTransformer model %s: %s", self._model_name, str(exc), exc_info=True)
                raise EmbeddingError(f"Failed to load embedding model: {self._model_name}") from exc

        return self._model

