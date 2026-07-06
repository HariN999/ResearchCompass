import os
from dotenv import load_dotenv

load_dotenv()

SUPPORTED_PROVIDERS = {"groq", "openrouter", "ollama"}


class Settings:
    def __init__(self) -> None:
        self.llm_provider = os.getenv("LLM_PROVIDER", "groq").strip().lower()
        self.llm_timeout_seconds = 120.0
        self.embedding_model_name = os.getenv("EMBEDDING_MODEL_NAME", "BAAI/bge-small-en-v1.5").strip()
        self.chroma_persist_directory = os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma").strip()
        self.chroma_collection_name = os.getenv("CHROMA_COLLECTION_NAME", "research_documents").strip()
        self.retrieval_top_k = 5

        # Provider configurations
        self.groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.groq_model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

        self.openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
        self.openrouter_model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct").strip()
        self.openrouter_site_url = os.getenv("OPENROUTER_SITE_URL", "").strip()
        self.openrouter_app_name = os.getenv("OPENROUTER_APP_NAME", "ResearchCompass").strip()

        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip()
        self.ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1:8b").strip()

    def validate(self) -> None:
        # 1. Validate LLM_PROVIDER
        if self.llm_provider not in SUPPORTED_PROVIDERS:
            raise ValueError(
                f'Unsupported provider "{self.llm_provider}".\n'
                f"Supported providers:\n"
                f"- groq\n"
                f"- openrouter\n"
                f"- ollama"
            )

        # 2. Validate provider specific requirements
        if self.llm_provider == "groq":
            if not self.groq_api_key:
                raise ValueError("GROQ_API_KEY is required when LLM_PROVIDER is 'groq'.")
        elif self.llm_provider == "openrouter":
            if not self.openrouter_api_key:
                raise ValueError("OPENROUTER_API_KEY is required when LLM_PROVIDER is 'openrouter'.")
        elif self.llm_provider == "ollama":
            if not self.ollama_base_url:
                raise ValueError("OLLAMA_BASE_URL is required when LLM_PROVIDER is 'ollama'.")
            if not (self.ollama_base_url.startswith("http://") or self.ollama_base_url.startswith("https://")):
                raise ValueError(f"Invalid OLLAMA_BASE_URL: '{self.ollama_base_url}'. Must start with http:// or https://.")

        # 3. Validate timeouts
        raw_timeout = os.getenv("LLM_TIMEOUT_SECONDS")
        if raw_timeout is not None:
            try:
                timeout = float(raw_timeout)
                if timeout <= 0:
                    raise ValueError()
                self.llm_timeout_seconds = timeout
            except ValueError:
                raise ValueError(f"LLM_TIMEOUT_SECONDS must be a positive numeric value, got '{raw_timeout}'.")

        # 4. Validate embedding configuration
        if not self.embedding_model_name:
            raise ValueError("EMBEDDING_MODEL_NAME cannot be empty.")

        # 5. Validate Chroma persistence directory
        if not self.chroma_persist_directory:
            raise ValueError("CHROMA_PERSIST_DIRECTORY cannot be empty.")

        # 6. Validate collection name
        if not self.chroma_collection_name:
            raise ValueError("CHROMA_COLLECTION_NAME cannot be empty.")

        # 7. Validate retrieval top_k
        raw_top_k = os.getenv("RETRIEVAL_TOP_K")
        if raw_top_k is not None:
            try:
                top_k = int(raw_top_k)
                if top_k <= 0:
                    raise ValueError()
                self.retrieval_top_k = top_k
            except ValueError:
                raise ValueError(f"RETRIEVAL_TOP_K must be a positive integer, got '{raw_top_k}'.")


settings = Settings()
settings.validate()
