import os

from providers.base import LLMProvider
from providers.groq import GroqProvider
from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider


def _required_environment_variable(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(f"{name} environment variable is not set.")
    return value


def _timeout_seconds() -> float:
    raw_value = os.getenv("LLM_TIMEOUT_SECONDS", "120")
    try:
        timeout = float(raw_value)
    except ValueError as exc:
        raise ValueError("LLM_TIMEOUT_SECONDS must be a number.") from exc
    if timeout <= 0:
        raise ValueError("LLM_TIMEOUT_SECONDS must be greater than zero.")
    return timeout


def create_llm_provider() -> LLMProvider:
    provider_name = os.getenv("LLM_PROVIDER", "groq").strip().lower()

    if provider_name == "groq":
        return GroqProvider(
            api_key=_required_environment_variable("GROQ_API_KEY"),
            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        )

    if provider_name == "openrouter":
        return OpenRouterProvider(
            api_key=_required_environment_variable("OPENROUTER_API_KEY"),
            model=os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct"),
            timeout_seconds=_timeout_seconds(),
            site_url=os.getenv("OPENROUTER_SITE_URL"),
            app_name=os.getenv("OPENROUTER_APP_NAME", "ResearchCompass"),
        )

    if provider_name == "ollama":
        return OllamaProvider(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            model=os.getenv("OLLAMA_MODEL", "llama3.1:8b"),
            timeout_seconds=_timeout_seconds(),
        )

    supported = "groq, openrouter, ollama"
    raise ValueError(
        f"Unsupported LLM_PROVIDER '{provider_name}'. Supported providers: {supported}."
    )
