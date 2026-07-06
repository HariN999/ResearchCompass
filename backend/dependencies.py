from functools import lru_cache
import os

from providers.factory import create_llm_provider
from services.analysis_service import AnalysisService
from services.document_ingestion_service import DocumentIngestionService
from services.embedding_service import DEFAULT_EMBEDDING_MODEL, EmbeddingService
from services.retrieval_service import RetrievalService
from services.vector_store_service import VectorStoreService


@lru_cache
def get_analysis_service() -> AnalysisService:
    return AnalysisService(create_llm_provider())


@lru_cache
def get_document_ingestion_service() -> DocumentIngestionService:
    return DocumentIngestionService()


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService(
        model_name=os.getenv("EMBEDDING_MODEL_NAME", DEFAULT_EMBEDDING_MODEL)
    )


@lru_cache
def get_vector_store_service() -> VectorStoreService:
    return VectorStoreService(
        embedding_service=get_embedding_service(),
        persist_directory=os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma"),
        collection_name=os.getenv("CHROMA_COLLECTION_NAME", "research_documents"),
    )


@lru_cache
def get_retrieval_service() -> RetrievalService:
    return RetrievalService(
        vector_store_service=get_vector_store_service(),
        top_k=int(os.getenv("RETRIEVAL_TOP_K", "5")),
    )
