import unittest
from unittest.mock import MagicMock

from exceptions import LLMProviderError
from providers.base import LLMProvider
from providers.fallback import FallbackLLMProvider


class FallbackLLMProviderTests(unittest.TestCase):
    def test_primary_succeeds(self) -> None:
        primary = MagicMock(spec=LLMProvider)
        primary.generate.return_value = "primary response"
        fallback = MagicMock(spec=LLMProvider)

        provider = FallbackLLMProvider(primary, fallback)
        res = provider.generate("system", "user")

        self.assertEqual(res, "primary response")
        primary.generate.assert_called_once_with("system", "user")
        fallback.generate.assert_not_called()

    def test_fallback_called_when_primary_fails(self) -> None:
        primary = MagicMock(spec=LLMProvider)
        primary.generate.side_effect = LLMProviderError("primary failed")
        fallback = MagicMock(spec=LLMProvider)
        fallback.generate.return_value = "fallback response"

        provider = FallbackLLMProvider(primary, fallback)
        res = provider.generate("system", "user")

        self.assertEqual(res, "fallback response")
        primary.generate.assert_called_once_with("system", "user")
        fallback.generate.assert_called_once_with("system", "user")

    def test_raises_when_both_fail(self) -> None:
        primary = MagicMock(spec=LLMProvider)
        primary.generate.side_effect = LLMProviderError("primary failed")
        fallback = MagicMock(spec=LLMProvider)
        fallback.generate.side_effect = LLMProviderError("fallback failed")

        provider = FallbackLLMProvider(primary, fallback)
        with self.assertRaises(LLMProviderError):
            provider.generate("system", "user")


if __name__ == "__main__":
    unittest.main()
