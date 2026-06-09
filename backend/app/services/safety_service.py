import re
from typing import Optional
from app.services.llm_service import LLMService


class SafetyFilter:
    PII_PATTERNS = [
        (r"\b\d{3}-\d{2}-\d{4}\b", "[SSN REDACTED]"),
        (r"\b\d{16}\b", "[CC REDACTED]"),
        (r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", "[PHONE REDACTED]"),
        (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL REDACTED]"),
    ]

    HARMFUL_PATTERNS = [
        r"\b(kill|murder|suicide|self-harm|self-harm)\w*\b",
        r"\b(hate|discriminat|racis|sexist)\w*\b",
        r"\b(terroris|bomb|explosive|weapon)\w*\b",
    ]

    @classmethod
    def redact_pii(cls, text: str) -> str:
        for pattern, replacement in cls.PII_PATTERNS:
            text = re.sub(pattern, replacement, text)
        return text

    @classmethod
    def contains_harmful_content(cls, text: str) -> tuple[bool, list[str]]:
        matches = []
        for pattern in cls.HARMFUL_PATTERNS:
            found = re.findall(pattern, text, re.IGNORECASE)
            if found:
                matches.extend(found)
        return len(matches) > 0, matches

    @classmethod
    def validate_safe(cls, text: str) -> dict:
        text = cls.redact_pii(text)
        harmful, matches = cls.contains_harmful_content(text)
        return {
            "is_safe": not harmful,
            "harmful_matches": matches,
            "redacted_text": text,
        }


class HallucinationGuard:
    def __init__(self):
        self.llm_service = LLMService()

    async def verify_grounding(self, response: str, context: list[dict]) -> dict:
        context_snippets = [c.get("content", {}).get("text", str(c))[:200] for c in context[:5]]
        context_text = "\n".join(context_snippets)

        check_schema = {
            "type": "object",
            "properties": {
                "is_grounded": {"type": "boolean"},
                "unsupported_claims": {"type": "array", "items": {"type": "string"}},
                "confidence": {"type": "number"},
            },
            "required": ["is_grounded", "unsupported_claims", "confidence"],
        }

        prompt = (
            f"Verify if the following response is grounded in the provided context.\n\n"
            f"Context:\n{context_text}\n\n"
            f"Response:\n{response}\n\n"
            f"List any claims in the response that are NOT supported by the context."
        )

        result = await self.llm_service.generate_structured(prompt, check_schema)
        return result

    async def get_fallback_response(self, query: str) -> str:
        return (
            "I found some relevant information, but I'm not confident enough to give a specific recommendation. "
            "Could you provide more details? For example, what domain does this relate to, or what specific outcome are you looking for?"
        )

    async def add_disclaimer(self, response: str, confidence: float) -> str:
        if confidence < 0.3:
            return f"{response}\n\n⚠️ I have low confidence in this recommendation. Please verify before acting."
        if confidence < 0.6:
            return f"{response}\n\n💡 Note: This has moderate confidence. Consider your own judgment."
        return response
