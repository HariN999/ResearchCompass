import unittest
from unittest.mock import patch

import config
from providers.factory import create_llm_provider
from providers.groq import GroqProvider
from providers.ollama import OllamaProvider
from providers.openrouter import OpenRouterProvider


class ProviderFactoryTests(unittest.TestCase):
    def setUp(self) -> None:
        self.original_settings = {}
        for k, v in config.settings.__dict__.items():
            self.original_settings[k] = v

    def tearDown(self) -> None:
        for k, v in self.original_settings.items():
            setattr(config.settings, k, v)

    def test_groq_is_the_default_provider(self) -> None:
        with patch.dict("os.environ", {"GROQ_API_KEY": "test-key"}, clear=True):
            config.settings.__init__()
            config.settings.validate()
            provider = create_llm_provider()

        self.assertIsInstance(provider, GroqProvider)

    def test_openrouter_can_be_selected(self) -> None:
        environment = {
            "LLM_PROVIDER": "openrouter",
            "OPENROUTER_API_KEY": "test-key",
        }
        with patch.dict("os.environ", environment, clear=True):
            config.settings.__init__()
            config.settings.validate()
            provider = create_llm_provider()

        self.assertIsInstance(provider, OpenRouterProvider)

    def test_ollama_can_be_selected_without_an_api_key(self) -> None:
        with patch.dict("os.environ", {"LLM_PROVIDER": "ollama"}, clear=True):
            config.settings.__init__()
            config.settings.validate()
            provider = create_llm_provider()

        self.assertIsInstance(provider, OllamaProvider)

    def test_unknown_provider_is_rejected(self) -> None:
        with patch.dict("os.environ", {"LLM_PROVIDER": "unknown"}, clear=True):
            with self.assertRaisesRegex(ValueError, 'Unsupported provider "unknown"'):
                config.settings.__init__()
                config.settings.validate()



if __name__ == "__main__":
    unittest.main()
