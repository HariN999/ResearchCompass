import logging
import httpx

from providers.base import LLMProvider, LLMProviderError

logger = logging.getLogger(__name__)


class OpenRouterProvider(LLMProvider):
    def __init__(
        self,
        api_key: str,
        model: str,
        timeout_seconds: float,
        site_url: str | None = None,
        app_name: str | None = None,
    ) -> None:
        self._api_key = api_key
        self._model = model
        self._timeout_seconds = timeout_seconds
        self._site_url = site_url
        self._app_name = app_name

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        if self._site_url:
            headers["HTTP-Referer"] = self._site_url
        if self._app_name:
            headers["X-Title"] = self._app_name

        logger.info("LLM request: sending generate request to OpenRouter model %s (input size: %d chars)", self._model, len(user_prompt))
        try:
            with httpx.Client(timeout=self._timeout_seconds) as client:
                response = client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json={
                        "model": self._model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "response_format": {"type": "json_object"},
                        "temperature": 0.3,
                    },
                )
                response.raise_for_status()
                payload = response.json()
        except httpx.TimeoutException as exc:
            logger.error("OpenRouter request timed out after %s seconds for model %s", self._timeout_seconds, self._model)
            raise LLMProviderError(f"OpenRouter connection timed out: {self._model}") from exc
        except httpx.HTTPStatusError as exc:
            logger.error("OpenRouter API returned HTTP error status %d for model %s: %s", exc.response.status_code, self._model, exc.response.text)
            raise LLMProviderError(f"OpenRouter HTTP error: {exc.response.status_code}") from exc
        except Exception as exc:
            logger.error("Unexpected network error while contacting OpenRouter for model %s: %s", self._model, str(exc), exc_info=True)
            raise LLMProviderError("Failed to communicate with OpenRouter.") from exc

        try:
            content = payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            logger.error("OpenRouter payload structure was invalid or choices list was empty. Payload: %s", str(payload))
            raise LLMProviderError("OpenRouter returned an invalid response structure.") from exc

        if not content:
            logger.warning("OpenRouter model %s returned empty content.", self._model)
            raise LLMProviderError("OpenRouter returned an empty response.")

        logger.info("LLM response: successfully received completion from OpenRouter model %s", self._model)
        return str(content)

