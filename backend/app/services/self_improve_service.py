from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.database import get_db
from app.services.memory_service import MemoryService
from app.services.analytics_service import AnalyticsService


class SelfImproveService:
    def __init__(self):
        self.memory_service = MemoryService()
        self.analytics_service = AnalyticsService()

    async def evaluate_decision_quality(self, user_id: str, days: int = 7) -> dict:
        db = get_db()
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        pipeline = [
            {"$match": {"user_id": user_id, "created_at": {"$gte": cutoff}}},
            {"$group": {
                "_id": None,
                "total_decisions": {"$sum": 1},
                "avg_quality": {"$avg": "$outcome.quality_score"},
                "total_followed": {
                    "$sum": {"$cond": [{"$eq": ["$user_action.was_followed_through", True]}, 1, 0]}
                },
            }},
        ]
        results = await db["user_decisions"].aggregate(pipeline).to_list(length=1)
        return results[0] if results else {"total_decisions": 0, "avg_quality": 0, "total_followed": 0}

    async def get_improvement_suggestions(self, user_id: str) -> list[dict]:
        quality = await self.evaluate_decision_quality(user_id)
        suggestions = []

        if quality.get("total_decisions", 0) < 5:
            suggestions.append({
                "area": "decision_frequency",
                "suggestion": "Increase decision logging frequency for better pattern detection",
                "priority": "low",
            })

        avg_quality = quality.get("avg_quality", 0) or 0
        if avg_quality < 0.5 and quality.get("total_decisions", 0) > 0:
            suggestions.append({
                "area": "recommendation_quality",
                "suggestion": "Decision outcomes below target — review recommendation logic",
                "priority": "high",
            })

        return suggestions

    async def prune_stale_memories(self, user_id: str, max_age_days: int = 90):
        db = get_db()
        cutoff = datetime.now(timezone.utc) - timedelta(days=max_age_days)
        result = await db["user_memories"].delete_many({
            "user_id": user_id,
            "created_at": {"$lt": cutoff},
            "importance_score": {"$lt": 0.3},
        })
        return {"deleted_count": result.deleted_count}

    async def update_preferences_from_outcomes(self, user_id: str):
        db = get_db()
        pipeline = [
            {"$match": {"user_id": user_id, "user_action.was_followed_through": True}},
            {"$unwind": "$recommendation.options"},
            {"$group": {
                "_id": "$recommendation.options.action_type",
                "count": {"$sum": 1},
                "avg_quality": {"$avg": "$outcome.quality_score"},
            }},
            {"$sort": {"avg_quality": -1}},
        ]
        results = await db["user_decisions"].aggregate(pipeline).to_list(length=20)
        return results
