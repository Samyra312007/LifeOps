import pytest
from app.services.memory_service import MemoryService
from app.services.pattern_service import PatternService
from app.services.action_service import ActionService
from app.models.memory import MemoryCreate


class TestMemoryService:
    @pytest.mark.asyncio
    async def test_create_and_get_memory(self):
        svc = MemoryService()
        memory = MemoryCreate(
            memory_type="test",
            domain="general",
            content={"text": "test content"},
            importance_score=0.5,
            tags=["test"],
        )
        mem_id = await svc.create_memory("test_user", memory)
        assert mem_id is not None
        assert len(mem_id) > 0


class TestPatternService:
    @pytest.mark.asyncio
    async def test_upsert_pattern(self):
        svc = PatternService()
        pattern_id = await svc.upsert_pattern(
            "test_user", "health", "sleep_debt",
            {"confidence": 0.8, "active": True},
        )
        assert pattern_id is not None


class TestActionService:
    @pytest.mark.asyncio
    async def test_record_decision(self):
        svc = ActionService()
        decision_id = await svc.record_decision("test_user", "trace-1", "Should I exercise today?")
        assert decision_id is not None

    @pytest.mark.asyncio
    async def test_follow_through_rate(self):
        svc = ActionService()
        rate = await svc.get_follow_through_rate("test_user")
        assert "rate" in rate
        assert "total" in rate
