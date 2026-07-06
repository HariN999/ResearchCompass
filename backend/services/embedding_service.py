from __future__ import annotations

from typing import Any


DEFAULT_EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"


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

        model = self._get_model()
        embeddings = model.encode(
            texts,
            normalize_embeddings=True,
            convert_to_numpy=True,
        )
        return embeddings.tolist()

    def embed_query(self, query: str) -> list[float]:
        embeddings = self.embed_documents([query])
        if not embeddings:
            raise ValueError("The query text is empty.")
        return embeddings[0]

    def _get_model(self) -> Any:
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:
                raise RuntimeError(
                    "sentence-transformers is not installed. Run pip install -r backend/requirements.txt."
                ) from exc

            self._model = SentenceTransformer(self._model_name)

        return self._model
