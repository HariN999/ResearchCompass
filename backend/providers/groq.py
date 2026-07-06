import logging
from groq import Groq

from providers.base import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)


class GroqProvider(LLMProvider):
    def __init__(self, api_key: str, model: str) -> None:
        self._client = Groq(api_key=api_key)
        self._model = model

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("LLM request: sending generate request to Groq model %s (input size: %d chars)", self._model, len(user_prompt))
        try:
            response = self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )

            content = response.choices[0].message.content
            if not content:
                logger.warning("Groq model %s returned an empty response.", self._model)
                raise LLMProviderError("Groq returned an empty response.")
            logger.info("LLM response: successfully received completion from Groq model %s", self._model)
            return content
        except Exception as exc:
            if isinstance(exc, LLMProviderError):
                raise
            logger.error("Groq API request failed for model %s: %s", self._model, str(exc), exc_info=True)
            raise LLMProviderError("Groq API execution failed.") from exc

