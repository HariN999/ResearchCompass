from functools import lru_cache

from config import settings
from providers.factory import create_llm_provider
from services.analysis_service import AnalysisService
from services.document_ingestion_service import DocumentIngestionService
from services.embedding_service import EmbeddingService
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
    return EmbeddingService(model_name=settings.embedding_model_name)


@lru_cache
def get_vector_store_service() -> VectorStoreService:
    return VectorStoreService(
        embedding_service=get_embedding_service(),
        persist_directory=settings.chroma_persist_directory,
        collection_name=settings.chroma_collection_name,
    )


@lru_cache
def get_retrieval_service() -> RetrievalService:
    return RetrievalService(
        vector_store_service=get_vector_store_service(),
        top_k=settings.retrieval_top_k,
    )
