import logging

from config import settings
from exceptions import ProviderConfigError
from providers.base import LLMProvider
from providers.groq import GroqProvider
from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider

logger = logging.getLogger(__name__)


def create_llm_provider() -> LLMProvider:
    provider_name = settings.llm_provider
    logger.info("Initializing LLM provider: %s", provider_name)

    if provider_name == "groq":
        return GroqProvider(
            api_key=settings.groq_api_key,
            model=settings.groq_model,
        )

    if provider_name == "openrouter":
        return OpenRouterProvider(
            api_key=settings.openrouter_api_key,
            model=settings.openrouter_model,
            timeout_seconds=settings.llm_timeout_seconds,
            site_url=settings.openrouter_site_url,
            app_name=settings.openrouter_app_name,
        )

    if provider_name == "ollama":
        return OllamaProvider(
            base_url=settings.ollama_base_url,
            model=settings.ollama_model,
            timeout_seconds=settings.llm_timeout_seconds,
        )

    supported = "groq, openrouter, ollama"
    logger.error("Configuration error: Unsupported LLM_PROVIDER '%s'", provider_name)
    raise ProviderConfigError(
        f"Unsupported LLM_PROVIDER '{provider_name}'. Supported providers: {supported}."
    )

