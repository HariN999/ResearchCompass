import tempfile
import unittest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
import os
import shutil

from app import app
from dependencies import get_vector_store_service, get_embedding_service, get_retrieval_service
from models import DocumentIngestionResult, DocumentMetadata, DocumentPage, DocumentChunk, RetrievedChunk
from services.vector_store_service import VectorStoreService
from services.embedding_service import EmbeddingService
from services.retrieval_service import RetrievalService


class PersistenceAndCrossDocTests(unittest.TestCase):
    def setUp(self) -> None:
        # Create a temp directory for Chroma persistence
        self.temp_dir = tempfile.mkdtemp()
        
        # Instantiate real services with temp directory
        self.embedding_service = EmbeddingService(model_name="BAAI/bge-small-en-v1.5")
        self.vector_store_service = VectorStoreService(
            embedding_service=self.embedding_service,
            persist_directory=self.temp_dir,
            collection_name="test_persistence_collection",
        )
        self.retrieval_service = RetrievalService(
            vector_store_service=self.vector_store_service,
            top_k=5,
        )
        self.client = TestClient(app)

    def tearDown(self) -> None:
        # Clean up temp directory
        shutil.rmtree(self.temp_dir)

    def _create_mock_ingestion_result(self, doc_id: str, title: str, author: str, chunks_text: list[str]) -> DocumentIngestionResult:
        metadata = DocumentMetadata(
            document_id=doc_id,
            file_name=f"{title.lower().replace(' ', '_')}.pdf",
            content_type="application/pdf",
            file_size_bytes=1000,
            page_count=len(chunks_text),
            total_char_count=sum(len(t) for t in chunks_text),
            total_word_count=sum(len(t.split()) for t in chunks_text),
            chunk_count=len(chunks_text),
            has_text_content=True,
            title=title,
            author=author,
        )
        
        pages = [
            DocumentPage(page_number=i + 1, text=text, char_count=len(text), word_count=len(text.split()))
            for i, text in enumerate(chunks_text)
        ]
        
        chunks = [
            DocumentChunk(
                chunk_id=f"chunk-{i}",
                chunk_index=i,
                text=text,
                char_count=len(text),
                word_count=len(text.split()),
                page_start=i + 1,
                page_end=i + 1,
                page_numbers=[i + 1],
                document_id=doc_id,
                page_number=i + 1,
                section="Introduction" if i == 0 else "Methodology",
                document_title=title,
                authors=author,
                created_at="2026-07-06T12:00:00Z"
            )
            for i, text in enumerate(chunks_text)
        ]
        
        return DocumentIngestionResult(metadata=metadata, pages=pages, chunks=chunks)

    def test_persistence(self) -> None:
        # 1. Index a document in the vector store
        ingest_res = self._create_mock_ingestion_result(
            doc_id="doc-persistence-1",
            title="Persistence Testing Paper",
            author="John Doe",
            chunks_text=["Chroma DB persistence is verified using temp directories."]
        )
        self.vector_store_service.index_document(ingest_res)
        
        # 2. Re-instantiate a new VectorStoreService pointing to the same persist_directory
        new_vector_store = VectorStoreService(
            embedding_service=self.embedding_service,
            persist_directory=self.temp_dir,
            collection_name="test_persistence_collection",
        )
        
        # 3. Retrieve chunks using the new service and verify persistence
        retrieved = new_vector_store.query(query_text="Chroma DB persistence", top_k=1)
        self.assertEqual(len(retrieved), 1)
        self.assertEqual(retrieved[0].document_id, "doc-persistence-1")
        self.assertIn("persistence", retrieved[0].text)

    def test_cross_document_retrieval(self) -> None:
        # Index document A about transformers
        doc_a = self._create_mock_ingestion_result(
            doc_id="doc-a",
            title="Transformer Scaling",
            author="Author A",
            chunks_text=["Transformers perform well on large text corpora.", "Self-attention mechanism details."]
        )
        self.vector_store_service.index_document(doc_a)
        
        # Index document B about computer vision
        doc_b = self._create_mock_ingestion_result(
            doc_id="doc-b",
            title="Vision Transformers",
            author="Author B",
            chunks_text=["Vision transformers apply self-attention to patches.", "Image classification on ImageNet."]
        )
        self.vector_store_service.index_document(doc_b)

        # Query without document filter (cross-document search)
        cross_results = self.retrieval_service.search(query="self-attention mechanism", top_k=4)
        
        # We should get results from both doc-a and doc-b since both discuss self-attention
        doc_ids = {r.document_id for r in cross_results}
        self.assertIn("doc-a", doc_ids)
        self.assertIn("doc-b", doc_ids)
        
        # Query with document filter (doc-a only)
        doc_a_results = self.vector_store_service.query(query_text="self-attention mechanism", top_k=2, document_id="doc-a")
        for chunk in doc_a_results:
            self.assertEqual(chunk.document_id, "doc-a")

    def test_api_search_and_documents(self) -> None:
        # Setup overrides for dependencies so FastAPIs TestClient uses our temp Chroma instance
        app.dependency_overrides[get_vector_store_service] = lambda: self.vector_store_service
        app.dependency_overrides[get_retrieval_service] = lambda: self.retrieval_service
        
        try:
            # Index document
            doc = self._create_mock_ingestion_result(
                doc_id="doc-test-api",
                title="API Verification Paper",
                author="Jane Doe",
                chunks_text=["FastAPI endpoint tests require mock dependency overrides."]
            )
            self.vector_store_service.index_document(doc)

            # Test GET /api/documents
            response_docs = self.client.get("/api/documents")
            self.assertEqual(response_docs.status_code, 200)
            docs_list = response_docs.json()
            self.assertEqual(len(docs_list), 1)
            self.assertEqual(docs_list[0]["id"], "doc-test-api")
            self.assertEqual(docs_list[0]["title"], "API Verification Paper")
            self.assertEqual(docs_list[0]["authors"], "Jane Doe")
            self.assertEqual(docs_list[0]["status"], "indexed")

            # Test POST /api/search
            search_payload = {
                "query": "endpoint tests",
                "top_k": 2
            }
            response_search = self.client.post("/api/search", json=search_payload)
            self.assertEqual(response_search.status_code, 200)
            search_results = response_search.json()["results"]
            self.assertEqual(len(search_results), 1)
            self.assertEqual(search_results[0]["document_id"], "doc-test-api")
            self.assertEqual(search_results[0]["document_title"], "API Verification Paper")
            self.assertIn("FastAPI", search_results[0]["text"])
        finally:
            # Clear FastAPI overrides to avoid affecting other tests
            app.dependency_overrides.clear()


if __name__ == "__main__":
    unittest.main()
