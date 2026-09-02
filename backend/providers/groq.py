import logging
from groq import Groq

from providers.base import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model: str) -> None:
        self._client = Groq(api_key=api_key)
        self._model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        # Truncate user prompt to stay under Groq's 8,000 TPM limit (~22,000 characters)
        MAX_PROMPT_CHARS = 22000
        if len(user_prompt) > MAX_PROMPT_CHARS:
            logger.warning(
                "LLM input size (%d chars) exceeds Groq rate limits. Truncating to %d chars.",
                len(user_prompt),
                MAX_PROMPT_CHARS
            )
            user_prompt = user_prompt[:MAX_PROMPT_CHARS]
            last_space = user_prompt.rfind(" ")
            if last_space != -1:
                user_prompt = user_prompt[:last_space]

        logger.info("LLM request: sending generate request to Groq model %s (input size: %d chars)", self._model, len(user_prompt))
        FALLBACK_MODEL = "llama-3.1-8b-instant"
        try:
            kwargs = {
                "model": self._model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.3,
                "max_tokens": 4096,
            }
            if "llama" in self._model.lower() or "openai" in self._model.lower() or "gpt-oss" in self._model.lower():
                kwargs["response_format"] = {"type": "json_object"}

            response = self._client.chat.completions.create(**kwargs)

            content = response.choices[0].message.content
            if not content:
                logger.warning("Groq model %s returned an empty response.", self._model)
                raise LLMProviderError("Groq returned an empty response.")
            logger.info("LLM response: successfully received completion from Groq model %s", self._model)
            return content
        except Exception as exc:
            if isinstance(exc, LLMProviderError) and "empty response" in str(exc):
                pass
            elif self._model != FALLBACK_MODEL:
                logger.warning(
                    "Groq primary model %s failed (%s). Retrying with high-throughput fallback model %s...",
                    self._model,
                    str(exc),
                    FALLBACK_MODEL
                )
                try:
                    kwargs["model"] = FALLBACK_MODEL
                    response = self._client.chat.completions.create(**kwargs)
                    content = response.choices[0].message.content
                    if content:
                        logger.info("LLM response: successfully received completion from fallback Groq model %s", FALLBACK_MODEL)
                        return content
                except Exception as fallback_exc:
                    logger.error("Groq fallback model %s also failed: %s", FALLBACK_MODEL, str(fallback_exc), exc_info=True)

            logger.error("Groq API request failed for model %s: %s", self._model, str(exc), exc_info=True)
            raise LLMProviderError(f"Groq API execution failed: {str(exc)}") from exc

