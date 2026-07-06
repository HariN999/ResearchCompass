import httpx

from providers.base import LLMProvider, LLMProviderError


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

        try:
            content = payload["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise LLMProviderError("OpenRouter returned an invalid response.") from exc

        if not content:
            raise LLMProviderError("OpenRouter returned an empty response.")
        return str(content)
