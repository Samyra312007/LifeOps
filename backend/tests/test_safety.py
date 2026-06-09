import pytest
from app.services.safety_service import SafetyFilter, HallucinationGuard


class TestSafetyFilter:
    def test_redact_pii_ssn(self):
        result = SafetyFilter.redact_pii("My SSN is 123-45-6789")
        assert "[SSN REDACTED]" in result
        assert "123-45-6789" not in result

    def test_redact_pii_email(self):
        result = SafetyFilter.redact_pii("Email me at test@example.com")
        assert "[EMAIL REDACTED]" in result

    def test_redact_pii_phone(self):
        result = SafetyFilter.redact_pii("Call 555-123-4567")
        assert "[PHONE REDACTED]" in result

    def test_contains_harmful_content_clean(self):
        is_harmful, matches = SafetyFilter.contains_harmful_content("What's the weather today?")
        assert not is_harmful
        assert len(matches) == 0

    def test_validate_safe(self):
        result = SafetyFilter.validate_safe("I need to kill my schedule")
        assert not result["is_safe"]
        assert len(result["harmful_matches"]) > 0


class TestHallucinationGuard:
    @pytest.mark.asyncio
    async def test_get_fallback(self):
        guard = HallucinationGuard()
        fallback = await guard.get_fallback_response("test query")
        assert len(fallback) > 10
