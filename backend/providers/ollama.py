import logging
import httpx

from providers.base import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str, model: str, timeout_seconds: float) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout_seconds = timeout_seconds
        self._client = httpx.Client(timeout=self._timeout_seconds)

    def __del__(self) -> None:
        try:
            if hasattr(self, "_client") and self._client:
                self._client.close()
        except Exception:
            pass

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        logger.info("LLM request: sending generate request to Ollama model %s (input size: %d chars)", self._model, len(user_prompt))
        try:
            response = self._client.post(
                f"{self._base_url}/api/chat",
                json={
                    "model": self._model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "format": "json",
                    "stream": False,
                    "options": {"temperature": 0.3},
                },
            )
            response.raise_for_status()
            payload = response.json()
        except httpx.TimeoutException as exc:
            logger.error("Ollama connection timed out after %s seconds for model %s", self._timeout_seconds, self._model)
            raise LLMProviderError(f"Ollama connection timed out: {self._model}") from exc
        except httpx.HTTPStatusError as exc:
            logger.error("Ollama API returned HTTP error status %d for model %s: %s", exc.response.status_code, self._model, exc.response.text)
            raise LLMProviderError(f"Ollama HTTP error status: {exc.response.status_code}") from exc
        except httpx.RequestError as exc:
            logger.error("Failed to connect or communicate with Ollama service at %s: %s", self._base_url, str(exc), exc_info=True)
            raise LLMProviderError(f"Ollama request error: failed to connect to local service.") from exc
        except Exception as exc:
            logger.error("Unexpected error during Ollama generation: %s", str(exc), exc_info=True)
            raise LLMProviderError("Ollama generation failed.") from exc

        try:
            content = payload["message"]["content"]
        except (KeyError, TypeError) as exc:
            logger.error("Ollama payload structure was invalid. Payload: %s", str(payload))
            raise LLMProviderError("Ollama returned an invalid response structure.") from exc

        if not content:
            logger.warning("Ollama model %s returned empty content.", self._model)
            raise LLMProviderError("Ollama returned an empty response.")

        logger.info("LLM response: successfully received completion from Ollama model %s", self._model)
        return str(content)

