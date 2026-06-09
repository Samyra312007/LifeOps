from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db


class SchedulingService:
    async def register_schedule(self, user_id: str, schedule_type: str, cron_expr: str, payload: dict) -> str:
        db = get_db()
        doc = {
            "user_id": user_id,
            "schedule_type": schedule_type,  # morning_brief, evening_brief, pattern_scan, data_sync
            "cron_expr": cron_expr,
            "payload": payload,
            "is_active": True,
            "last_run_at": None,
            "next_run_at": None,
            "created_at": datetime.now(timezone.utc),
        }
        result = await db["schedules"].insert_one(doc)
        return str(result.inserted_id)

    async def get_user_schedules(self, user_id: str) -> list[dict]:
        db = get_db()
        cursor = db["schedules"].find({"user_id": user_id, "is_active": True})
        schedules = await cursor.to_list(length=20)
        for s in schedules:
            s["id"] = str(s.pop("_id"))
        return schedules

    async def setup_default_brief_schedules(self, user_id: str, wake_time: str = "07:00", bed_time: str = "23:00"):
        hour, minute = wake_time.split(":")
        morning_cron = f"{minute} {hour} * * *"
        hour_e, minute_e = bed_time.split(":")
        evening_cron = f"{minute_e} {hour_e} * * *"

        await self.register_schedule(
            user_id, "morning_brief", morning_cron,
            {"type": "morning_brief", "delivery": "push+in_app"},
        )
        await self.register_schedule(
            user_id, "evening_brief", evening_cron,
            {"type": "evening_brief", "delivery": "in_app"},
        )

    async def record_run(self, schedule_id: str):
        db = get_db()
        now = datetime.now(timezone.utc)
        from bson import ObjectId
        await db["schedules"].update_one(
            {"_id": ObjectId(schedule_id)},
            {"$set": {"last_run_at": now, "next_run_at": None}},
        )
