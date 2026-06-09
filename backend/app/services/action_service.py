from typing import Optional
from app.core.database import get_db
from app.models.decision import DecisionModel, UserAction
from bson import ObjectId
from datetime import datetime, timezone


class ActionService:
    def __init__(self):
        self.collection = None

    async def _coll(self):
        if self.collection is None:
            db = get_db()
            self.collection = db["user_decisions"]
        return self.collection

    async def record_decision(self, user_id: str, trace_id: str, query: str) -> str:
        coll = await self._coll()
        doc = {
            "user_id": user_id,
            "trace_id": trace_id,
            "query": query,
            "synthesized_context": "",
            "recommendation": {},
            "user_action": None,
            "outcome": None,
            "created_at": datetime.now(timezone.utc),
        }
        result = await coll.insert_one(doc)
        return str(result.inserted_id)

    async def update_context(self, decision_id: str, context: str):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(decision_id)},
            {"$set": {"synthesized_context": context}},
        )

    async def update_recommendation(self, decision_id: str, recommendation: dict):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(decision_id)},
            {"$set": {"recommendation": recommendation}},
        )

    async def log_user_action(self, decision_id: str, action: UserAction):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(decision_id)},
            {"$set": {"user_action": action.model_dump()}},
        )

    async def get_decisions(self, user_id: str, limit: int = 20) -> list[dict]:
        coll = await self._coll()
        cursor = coll.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_decision(self, decision_id: str) -> Optional[dict]:
        coll = await self._coll()
        return await coll.find_one({"_id": ObjectId(decision_id)})

    async def get_follow_through_rate(self, user_id: str) -> dict:
        coll = await self._coll()
        pipeline = [
            {"$match": {"user_id": user_id, "user_action": {"$ne": None}}},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "followed": {
                        "$sum": {"$cond": [{"$eq": ["$user_action.was_followed_through", True]}, 1, 0]}
                    },
                }
            },
        ]
        results = await coll.aggregate(pipeline).to_list(length=1)
        if results:
            r = results[0]
            return {"total": r["total"], "followed": r["followed"], "rate": r["followed"] / r["total"] if r["total"] > 0 else 0}
        return {"total": 0, "followed": 0, "rate": 0}
