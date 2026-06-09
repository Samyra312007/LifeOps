from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.models.memory import MemoryModel, MemoryCreate
from bson import ObjectId


class MemoryService:
    def __init__(self):
        self.collection = None

    async def _coll(self):
        if self.collection is None:
            db = get_db()
            self.collection = db["user_memories"]
        return self.collection

    async def create_memory(self, user_id: str, data: MemoryCreate) -> str:
        coll = await self._coll()
        doc = {
            "user_id": user_id,
            "memory_type": data.memory_type,
            "domain": data.domain,
            "content": data.content,
            "importance_score": data.importance_score,
            "access_count": 0,
            "tags": data.tags,
            "source_trace_ids": [],
            "created_at": datetime.now(timezone.utc),
            "last_accessed_at": datetime.now(timezone.utc),
            "expires_at": None,
        }
        result = await coll.insert_one(doc)
        return str(result.inserted_id)

    async def get_memories(
        self,
        user_id: str,
        memory_types: Optional[list[str]] = None,
        domain: Optional[str] = None,
        limit: int = 20,
    ) -> list[dict]:
        coll = await self._coll()
        query = {"user_id": user_id}
        if memory_types:
            query["memory_type"] = {"$in": memory_types}
        if domain:
            query["domain"] = domain
        cursor = coll.find(query).sort("importance_score", -1).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_important_memories(self, user_id: str, domain: str, top_k: int = 5) -> list[dict]:
        coll = await self._coll()
        query = {"user_id": user_id, "domain": domain}
        cursor = coll.find(query).sort("importance_score", -1).limit(top_k)
        return await cursor.to_list(length=top_k)

    async def update_importance(self, memory_id: str, score: float):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(memory_id)},
            {"$set": {"importance_score": score, "last_accessed_at": datetime.now(timezone.utc)},
             "$inc": {"access_count": 1}},
        )

    async def delete_memory(self, memory_id: str):
        coll = await self._coll()
        await coll.delete_one({"_id": ObjectId(memory_id)})

    async def search_memories(self, user_id: str, query_text: str, limit: int = 10) -> list[dict]:
        coll = await self._coll()
        cursor = coll.find(
            {"user_id": user_id, "$text": {"$search": query_text}},
            {"score": {"$meta": "textScore"}},
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)
        return await cursor.to_list(length=limit)
