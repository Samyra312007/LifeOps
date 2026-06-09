from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from bson import ObjectId


class ConnectorService:
    def __init__(self):
        self.collection = None

    async def _coll(self):
        if self.collection is None:
            db = get_db()
            self.collection = db["user_connectors"]
        return self.collection

    async def register_connector(self, user_id: str, source: str, oauth_tokens: dict = None) -> str:
        coll = await self._coll()
        existing = await coll.find_one({"user_id": user_id, "source": source})
        now = datetime.now(timezone.utc)
        if existing:
            update = {"last_sync_at": now, "status": "active", "updated_at": now}
            if oauth_tokens:
                update["oauth_tokens"] = oauth_tokens
            await coll.update_one({"_id": existing["_id"]}, {"$set": update})
            return str(existing["_id"])
        doc = {
            "user_id": user_id,
            "source": source,
            "status": "active",
            "oauth_tokens": oauth_tokens or {},
            "connected_at": now,
            "last_sync_at": None,
            "last_sync_status": None,
            "error_message": None,
            "sync_frequency_minutes": 15,
            "settings": {},
        }
        result = await coll.insert_one(doc)
        return str(result.inserted_id)

    async def get_connectors(self, user_id: str) -> list[dict]:
        coll = await self._coll()
        cursor = coll.find({"user_id": user_id})
        connectors = await cursor.to_list(length=50)
        for c in connectors:
            c["id"] = str(c.pop("_id"))
            c.pop("oauth_tokens", None)
        return connectors

    async def get_connector(self, connector_id: str) -> Optional[dict]:
        coll = await self._coll()
        doc = await coll.find_one({"_id": ObjectId(connector_id)})
        if doc:
            doc["id"] = str(doc.pop("_id"))
        return doc

    async def update_sync_status(self, connector_id: str, status: str, error: str = None):
        coll = await self._coll()
        update = {
            "last_sync_at": datetime.now(timezone.utc),
            "last_sync_status": status,
        }
        if error:
            update["status"] = "error"
            update["error_message"] = error
        await coll.update_one({"_id": ObjectId(connector_id)}, {"$set": update})

    async def disconnect(self, connector_id: str):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(connector_id)},
            {"$set": {"status": "disconnected", "updated_at": datetime.now(timezone.utc)}},
        )

    async def store_oauth_state(self, user_id: str, source: str, state_token: str, expires_in: int = 600):
        db = get_db()
        await db["oauth_states"].insert_one({
            "user_id": user_id,
            "source": source,
            "state_token": state_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc).timestamp() + expires_in,
        })

    async def validate_oauth_state(self, state_token: str) -> Optional[dict]:
        db = get_db()
        state = await db["oauth_states"].find_one({"state_token": state_token})
        if state and state["expires_at"] > datetime.now(timezone.utc).timestamp():
            await db["oauth_states"].delete_one({"_id": state["_id"]})
            return state
        return None

    async def get_oauth_tokens(self, connector_id: str) -> Optional[dict]:
        coll = await self._coll()
        doc = await coll.find_one({"_id": ObjectId(connector_id)})
        if doc:
            return doc.get("oauth_tokens")
        return None

    CONNECTOR_SOURCES = [
        "gmail", "calendar", "plaid", "fit", "amazon", "doordash",
        "spotify", "todoist", "github", "strava", "uber", "netflix",
    ]

    @classmethod
    def get_available_sources(cls) -> list[str]:
        return cls.CONNECTOR_SOURCES
