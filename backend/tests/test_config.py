import unittest
from unittest.mock import patch
from config import Settings


class ConfigValidationTests(unittest.TestCase):
    def test_default_config_is_valid_with_groq_key(self) -> None:
        env = {
            "GROQ_API_KEY": "some-key",
            "LLM_PROVIDER": "groq",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            settings.validate()
            self.assertEqual(settings.llm_provider, "groq")
            self.assertEqual(settings.groq_api_key, "some-key")

    def test_unsupported_provider_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "abc",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, 'Unsupported provider "abc"'):
                settings.validate()

    def test_missing_groq_key_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "groq",
            "GROQ_API_KEY": "",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, "GROQ_API_KEY is required"):
                settings.validate()

    def test_missing_openrouter_key_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "openrouter",
            "OPENROUTER_API_KEY": "",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, "OPENROUTER_API_KEY is required"):
                settings.validate()

    def test_ollama_invalid_url_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "ollama",
            "OLLAMA_BASE_URL": "localhost:11434",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, "Invalid OLLAMA_BASE_URL"):
                settings.validate()

    def test_invalid_timeout_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "groq",
            "GROQ_API_KEY": "some-key",
            "LLM_TIMEOUT_SECONDS": "0",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, "LLM_TIMEOUT_SECONDS must be a positive numeric value"):
                settings.validate()

    def test_invalid_top_k_raises_error(self) -> None:
        env = {
            "LLM_PROVIDER": "groq",
            "GROQ_API_KEY": "some-key",
            "RETRIEVAL_TOP_K": "-5",
        }
        with patch.dict("os.environ", env, clear=True):
            settings = Settings()
            with self.assertRaisesRegex(ValueError, "RETRIEVAL_TOP_K must be a positive integer"):
                settings.validate()


if __name__ == "__main__":
    unittest.main()
