from datetime import datetime, timezone, timedelta
from typing import Optional
from app.core.database import get_db
from app.models.alert import AlertLogCreate, AlertAction
from bson import ObjectId


class AlertEngine:
    def __init__(self):
        self.collection = None

    async def _coll(self):
        if self.collection is None:
            db = get_db()
            self.collection = db["alert_log"]
        return self.collection

    async def send_alert(self, user_id: str, alert: AlertLogCreate) -> str:
        coll = await self._coll()
        expires_at = None
        if alert.is_critical:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=72)
        else:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=24)

        doc = {
            "user_id": user_id,
            "alert_type": alert.alert_type,
            "domain": alert.domain,
            "title": alert.title,
            "body": alert.body,
            "actions": [a.model_dump() for a in alert.actions],
            "delivery_channel": alert.delivery_channel,
            "delivered_at": datetime.now(timezone.utc),
            "read_at": None,
            "user_response": None,
            "is_critical": alert.is_critical,
            "expires_at": expires_at,
        }
        result = await coll.insert_one(doc)
        alert_id = str(result.inserted_id)

        # If push channel, also record a push event
        if alert.delivery_channel == "push":
            await self._queue_push_notification(user_id, alert.title, alert.body)

        return alert_id

    async def _queue_push_notification(self, user_id: str, title: str, body: str):
        db = get_db()
        await db["push_queue"].insert_one({
            "user_id": user_id,
            "title": title,
            "body": body,
            "status": "pending",
            "created_at": datetime.now(timezone.utc),
        })

    async def mark_read(self, alert_id: str):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {"read_at": datetime.now(timezone.utc)}},
        )

    async def record_response(self, alert_id: str, action: str, action_id: Optional[str] = None):
        coll = await self._coll()
        await coll.update_one(
            {"_id": ObjectId(alert_id)},
            {"$set": {
                "user_response": {
                    "action": action,
                    "action_id": action_id,
                    "responded_at": datetime.now(timezone.utc),
                }
            }},
        )

    async def has_recent_alert(self, user_id: str, alert_type: str, domain: str, cooldown_hours: int = 48) -> bool:
        coll = await self._coll()
        cutoff = datetime.now(timezone.utc) - timedelta(hours=cooldown_hours)
        existing = await coll.find_one({
            "user_id": user_id,
            "alert_type": alert_type,
            "domain": domain,
            "delivered_at": {"$gte": cutoff},
        })
        return existing is not None

    async def get_alerts(self, user_id: str, unread_only: bool = False, limit: int = 50) -> list[dict]:
        coll = await self._coll()
        query = {"user_id": user_id}
        if unread_only:
            query["read_at"] = None
        cursor = coll.find(query).sort("delivered_at", -1).limit(limit)
        alerts = await cursor.to_list(length=limit)
        for a in alerts:
            a["id"] = str(a.pop("_id"))
        return alerts

    async def get_unread_count(self, user_id: str) -> int:
        coll = await self._coll()
        return await coll.count_documents({"user_id": user_id, "read_at": None})
