import logging
from providers.base import LLMProvider
from exceptions import LLMProviderError

logger = logging.getLogger(__name__)


class FallbackLLMProvider(LLMProvider):
    """Wrapper that tries a primary LLM provider and falls back to an alternative if it fails."""

    def __init__(self, primary: LLMProvider, fallback: LLMProvider) -> None:
        self._primary = primary
        self._fallback = fallback

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        try:
            logger.info("Sending generation request to primary LLM provider...")
            return self._primary.generate(system_prompt, user_prompt)
        except LLMProviderError as exc:
            logger.warning(
                "Primary LLM provider failed. Attempting fallback provider... Error: %s",
                str(exc),
                exc_info=True,
            )
            try:
                logger.info("Sending generation request to fallback LLM provider...")
                return self._fallback.generate(system_prompt, user_prompt)
            except Exception as fallback_exc:
                logger.error(
                    "Fallback LLM provider also failed: %s",
                    str(fallback_exc),
                    exc_info=True,
                )
                if isinstance(fallback_exc, LLMProviderError):
                    raise fallback_exc
                raise LLMProviderError("Both primary and fallback LLM providers failed.") from fallback_exc
