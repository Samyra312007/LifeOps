import pytest
from app.services.gdpr_service import GDPRService
from app.services.social_tracker import SocialCommitmentTracker
from app.services.safety_service import SafetyFilter


class TestGDPRService:
    @pytest.mark.asyncio
    async def test_export_empty_user(self):
        svc = GDPRService()
        result = await svc.export_user_data("nonexistent_user")
        assert "exported_at" in result
        assert "user_id" in result


class TestSocialTracker:
    @pytest.mark.asyncio
    async def test_relationship_health_empty(self):
        tracker = SocialCommitmentTracker()
        result = await tracker.get_relationship_health("nonexistent_user")
        assert isinstance(result, list)


class TestSafetyFilter:
    def test_redact_pii_ssn(self):
        result = SafetyFilter.redact_pii("SSN: 123-45-6789")
        assert "[SSN REDACTED]" in result
