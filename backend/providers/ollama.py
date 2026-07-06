import httpx

from providers.base import LLMProvider, LLMProviderError


class OllamaProvider(LLMProvider):
    def __init__(self, base_url: str, model: str, timeout_seconds: float) -> None:
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout_seconds = timeout_seconds

    def generate(self, system_prompt: str, user_prompt: str) -> str:
        with httpx.Client(timeout=self._timeout_seconds) as client:
            response = client.post(
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

        try:
            content = payload["message"]["content"]
        except (KeyError, TypeError) as exc:
            raise LLMProviderError("Ollama returned an invalid response.") from exc

        if not content:
            raise LLMProviderError("Ollama returned an empty response.")
        return str(content)
