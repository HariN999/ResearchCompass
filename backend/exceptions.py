class ResearchCompassError(ValueError):
    """Base exception for all ResearchCompass application errors."""
    pass


class DocumentIngestionError(ResearchCompassError):
    """Base exception for all document ingestion and PDF processing errors."""
    pass


class InvalidPDFError(DocumentIngestionError):
    """Raised when the uploaded file is not a valid PDF format."""
    pass


class PasswordProtectedPDFError(DocumentIngestionError):
    """Raised when the PDF is password-protected and cannot be read."""
    pass


class EmptyDocumentError(DocumentIngestionError):
    """Raised when the uploaded PDF is empty or contains no extractable text."""
    pass


class DocumentSizeLimitError(DocumentIngestionError):
    """Raised when the PDF file size exceeds the allowed threshold."""
    pass


class DocumentPageLimitError(DocumentIngestionError):
    """Raised when the PDF page count exceeds the allowed threshold."""
    pass


class EmbeddingError(ResearchCompassError):
    """Raised when embedding model loads or generation operations fail."""
    pass


class VectorStoreError(ResearchCompassError):
    """Raised when ChromaDB initialization, indexing, or queries fail."""
    pass


class LLMProviderError(ResearchCompassError):
    """Raised when an LLM provider fails or returns an unusable response."""
    pass


class ProviderConfigError(ResearchCompassError):
    """Raised when LLM provider configuration is invalid or missing required variables."""
    pass


class AnalysisError(ResearchCompassError):
    """Base exception for academic analysis failures."""
    pass


class InvalidLLMResponseError(AnalysisError):
    """Raised when the LLM returns empty, malformed JSON, or validation fails."""
    pass
