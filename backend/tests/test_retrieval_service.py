import unittest

from models import DocumentChunk, DocumentIngestionResult, DocumentMetadata, RetrievedChunk
from services.embedding_service import EmbeddingService
from services.retrieval_service import RetrievalService
from services.vector_store_service import VectorStoreService


class FakeEmbeddingModel:
    def encode(self, texts, normalize_embeddings, convert_to_numpy):  # noqa: ANN001
        return FakeEmbeddings([[float(len(text)), 1.0] for text in texts])


class FakeEmbeddings:
    def __init__(self, values: list[list[float]]) -> None:
        self._values = values

    def tolist(self) -> list[list[float]]:
        return self._values


class FakeCollection:
    def __init__(self) -> None:
        self.upsert_calls: list[dict[str, object]] = []
        self.query_response = {
            "ids": [["doc-1:chunk-0000"]],
            "documents": [["retrieved chunk text"]],
            "distances": [[0.25]],
            "metadatas": [[
                {
                    "document_id": "doc-1",
                    "chunk_id": "chunk-0000",
                    "page_start": 1,
                    "page_end": 2,
                    "page_numbers": "1,2",
                    "file_name": "paper.pdf",
                }
            ]],
        }

    def upsert(self, **kwargs):  # noqa: ANN003
        self.upsert_calls.append(kwargs)

    def query(self, **kwargs):  # noqa: ANN003
        self.last_query = kwargs
        return self.query_response


class FakeClient:
    def __init__(self, collection: FakeCollection) -> None:
        self.collection = collection

    def get_or_create_collection(self, name: str, metadata: dict[str, str]) -> FakeCollection:
        self.last_collection_name = name
        self.last_metadata = metadata
        return self.collection


def _sample_ingestion_result() -> DocumentIngestionResult:
    return DocumentIngestionResult(
        metadata=DocumentMetadata(
            document_id="doc-1",
            file_name="paper.pdf",
            content_type="application/pdf",
            file_size_bytes=1024,
            page_count=2,
            total_char_count=100,
            total_word_count=20,
            chunk_count=1,
            has_text_content=True,
        ),
        pages=[],
        chunks=[
            DocumentChunk(
                chunk_id="chunk-0000",
                chunk_index=0,
                text="retrieved chunk text",
                char_count=20,
                word_count=3,
                page_start=1,
                page_end=2,
                page_numbers=[1, 2],
            )
        ],
    )


class EmbeddingServiceTests(unittest.TestCase):
    def test_embedding_service_uses_configured_model(self) -> None:
        service = EmbeddingService(model_name="BAAI/bge-small-en-v1.5", model=FakeEmbeddingModel())

        embeddings = service.embed_documents(["hello world"])
        query_embedding = service.embed_query("query text")

        self.assertEqual(embeddings, [[11.0, 1.0]])
        self.assertEqual(query_embedding, [10.0, 1.0])


class VectorStoreServiceTests(unittest.TestCase):
    def test_index_document_upserts_chunk_embeddings(self) -> None:
        collection = FakeCollection()
        service = VectorStoreService(
            embedding_service=EmbeddingService(model=FakeEmbeddingModel()),
            client=FakeClient(collection),
        )

        service.index_document(_sample_ingestion_result())

        self.assertEqual(len(collection.upsert_calls), 1)
        upsert_payload = collection.upsert_calls[0]
        self.assertEqual(upsert_payload["ids"], ["doc-1:chunk-0000"])
        self.assertEqual(upsert_payload["documents"], ["retrieved chunk text"])
        self.assertEqual(upsert_payload["embeddings"], [[20.0, 1.0]])

    def test_query_returns_retrieved_chunks(self) -> None:
        collection = FakeCollection()
        service = VectorStoreService(
            embedding_service=EmbeddingService(model=FakeEmbeddingModel()),
            client=FakeClient(collection),
        )

        results = service.query(query_text="find methodology", top_k=3, document_id="doc-1")

        self.assertEqual(len(results), 1)
        self.assertIsInstance(results[0], RetrievedChunk)
        self.assertEqual(results[0].document_id, "doc-1")
        self.assertEqual(results[0].page_numbers, [1, 2])
        self.assertEqual(collection.last_query["where"], {"document_id": "doc-1"})


class RetrievalServiceTests(unittest.TestCase):
    def test_retrieval_service_delegates_index_and_query(self) -> None:
        class FakeVectorStore:
            def __init__(self) -> None:
                self.indexed: list[DocumentIngestionResult] = []
                self.query_calls: list[dict[str, object]] = []

            def index_document(self, ingestion_result: DocumentIngestionResult) -> None:
                self.indexed.append(ingestion_result)

            def query(
                self,
                *,
                query_text: str,
                top_k: int,
                document_id: str | None,
            ) -> list[RetrievedChunk]:
                self.query_calls.append(
                    {
                        "query_text": query_text,
                        "top_k": top_k,
                        "document_id": document_id,
                    }
                )
                return []

        vector_store = FakeVectorStore()
        service = RetrievalService(vector_store_service=vector_store, top_k=4)
        ingestion_result = _sample_ingestion_result()

        service.index_document(ingestion_result)
        results = service.retrieve(query_text="baseline comparison", document_id="doc-1")

        self.assertEqual(vector_store.indexed, [ingestion_result])
        self.assertEqual(results, [])
        self.assertEqual(
            vector_store.query_calls,
            [{"query_text": "baseline comparison", "top_k": 4, "document_id": "doc-1"}],
        )


if __name__ == "__main__":
    unittest.main()
