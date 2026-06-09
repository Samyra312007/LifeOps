from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.services.memory_service import MemoryService
from app.services.analytics_service import AnalyticsService
from app.services.pattern_service import PatternService


class BriefService:
    def __init__(self):
        self.memory_service = MemoryService()
        self.analytics_service = AnalyticsService()
        self.pattern_service = PatternService()

    async def build_context(self, user_id: str, date: Optional[str] = None) -> dict:
        ds = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_summary = await self.analytics_service.get_daily_summary(user_id, ds)
        active_patterns = await self.pattern_service.get_active_patterns(user_id)
        recent_memories = await self.memory_service.get_memories(user_id, limit=10)

        return {
            "user_id": user_id,
            "date": ds,
            "daily_summary": daily_summary[0] if daily_summary else {},
            "active_patterns": active_patterns,
            "recent_memories": recent_memories,
        }

    async def generate_brief(self, user_id: str) -> dict:
        context = await self.build_context(user_id)
        brief = {
            "date": context["date"],
            "sections": [
                {"id": "overview", "title": "Today at a Glance", "content": "", "priority": 1},
                {"id": "patterns", "title": "Active Patterns", "content": [], "priority": 2},
                {"id": "actions", "title": "Suggested Actions", "content": [], "priority": 3},
                {"id": "reminders", "title": "Key Reminders", "content": [], "priority": 4},
            ],
            "metadata": context,
        }
        return brief

    async def generate_morning_brief(self, user_id: str) -> dict:
        context = await self.build_context(user_id)
        brief = await self.generate_brief(user_id)
        brief["type"] = "morning"
        brief["sections"].insert(0, {
            "id": "focus",
            "title": "Today's Focus Area",
            "content": "",
            "priority": 0,
        })
        return brief

    async def generate_evening_brief(self, user_id: str) -> dict:
        context = await self.build_context(user_id)
        brief = await self.generate_brief(user_id)
        brief["type"] = "evening"
        brief["sections"].append({
            "id": "reflection",
            "title": "Evening Reflection",
            "content": "",
            "priority": 5,
        })
        return brief
