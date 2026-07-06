import unittest
from unittest.mock import patch

from providers.factory import create_llm_provider
from providers.groq import GroqProvider
from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider


class ProviderFactoryTests(unittest.TestCase):
    def test_groq_is_the_default_provider(self) -> None:
        with patch.dict("os.environ", {"GROQ_API_KEY": "test-key"}, clear=True):
            provider = create_llm_provider()

        self.assertIsInstance(provider, GroqProvider)

    def test_openrouter_can_be_selected(self) -> None:
        environment = {
            "LLM_PROVIDER": "openrouter",
            "OPENROUTER_API_KEY": "test-key",
        }
        with patch.dict("os.environ", environment, clear=True):
            provider = create_llm_provider()

        self.assertIsInstance(provider, OpenRouterProvider)

    def test_ollama_can_be_selected_without_an_api_key(self) -> None:
        with patch.dict("os.environ", {"LLM_PROVIDER": "ollama"}, clear=True):
            provider = create_llm_provider()

        self.assertIsInstance(provider, OllamaProvider)

    def test_unknown_provider_is_rejected(self) -> None:
        with patch.dict("os.environ", {"LLM_PROVIDER": "unknown"}, clear=True):
            with self.assertRaisesRegex(ValueError, "Unsupported LLM_PROVIDER"):
                create_llm_provider()


if __name__ == "__main__":
    unittest.main()
