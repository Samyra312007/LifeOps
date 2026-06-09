from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from bson import ObjectId


class PatternService:
    def __init__(self):
        self.collection = None

    async def _coll(self):
        if self.collection is None:
            db = get_db()
            self.collection = db["user_patterns"]
        return self.collection

    async def get_active_patterns(self, user_id: str) -> list[dict]:
        coll = await self._coll()
        cursor = coll.find({"user_id": user_id, "active": True}).sort("confidence", -1)
        return await cursor.to_list(length=50)

    async def get_all_patterns(self, user_id: str) -> list[dict]:
        coll = await self._coll()
        cursor = coll.find({"user_id": user_id}).sort("updated_at", -1)
        return await cursor.to_list(length=100)

    async def upsert_pattern(self, user_id: str, domain: str, pattern_type: str, data: dict) -> str:
        coll = await self._coll()
        existing = await coll.find_one({"user_id": user_id, "pattern_type": pattern_type, "domain": domain})
        now = datetime.now(timezone.utc)
        if existing:
            await coll.update_one(
                {"_id": existing["_id"]},
                {"$set": {**data, "updated_at": now}},
            )
            return str(existing["_id"])
        result = await coll.insert_one({
            "user_id": user_id,
            "domain": domain,
            "pattern_type": pattern_type,
            "pattern_signature": {},
            "confidence": 0.0,
            "occurrences": [],
            "last_occurrence": None,
            "recurrence_count": 0,
            "active": False,
            "created_at": now,
            "updated_at": now,
        })
        return str(result.inserted_id)

    async def record_occurrence(self, pattern_id: str, occurrence: dict):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(pattern_id)},
            {
                "$push": {"occurrences": occurrence},
                "$set": {"last_occurrence": occurrence.get("start_date"), "active": True},
                "$inc": {"recurrence_count": 1},
            },
        )

    async def deactivate_pattern(self, pattern_id: str):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(pattern_id)},
            {"$set": {"active": False, "updated_at": datetime.now(timezone.utc)}},
        )

    async def get_pattern_by_type(self, user_id: str, pattern_type: str) -> Optional[dict]:
        coll = await self._coll()
        return await coll.find_one({"user_id": user_id, "pattern_type": pattern_type})
