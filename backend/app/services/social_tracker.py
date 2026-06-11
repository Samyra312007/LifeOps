from datetime import datetime, timezone, timedelta
from typing import Optional
from bson import ObjectId
from app.core.database import get_db
from app.services.llm_service import LLMService


class SocialCommitmentTracker:
    def __init__(self):
        self.llm_service = LLMService()

    async def detect_birthdays(self, user_id: str) -> list[dict]:
        db = get_db()
        birthdays = []
        cursor = db["user_relationships"].find({"user_id": user_id})
        relationships = await cursor.to_list(length=100)
        for rel in relationships:
            for d in rel.get("important_dates", []):
                if d.get("date_type") == "birthday" or d.get("type") == "birthday":
                    bday = d.get("date", "")
                    if bday:
                        from dateutil import parser
                        try:
                            dt = parser.parse(bday) if isinstance(bday, str) else bday
                            if hasattr(dt, "month") and hasattr(dt, "day"):
                                today = datetime.now(timezone.utc)
                                upcoming = datetime(today.year, dt.month, dt.day, tzinfo=timezone.utc)
                                if upcoming < today:
                                    upcoming = datetime(today.year + 1, dt.month, dt.day, tzinfo=timezone.utc)
                                days_until = (upcoming - today).days
                                birthdays.append({
                                    "contact_name": rel.get("contact_name", "Unknown"),
                                    "contact_email": rel.get("contact_email"),
                                    "birthday": bday,
                                    "days_until": days_until,
                                    "relationship_id": str(rel["_id"]),
                                })
                        except Exception:
                            pass
        return sorted(birthdays, key=lambda x: x["days_until"])

    async def get_relationship_health(self, user_id: str) -> list[dict]:
        db = get_db()
        cursor = db["user_relationships"].find({"user_id": user_id})
        relationships = await cursor.to_list(length=100)
        health_scores = []
        today = datetime.now(timezone.utc)
        for rel in relationships:
            last_contact = rel.get("last_contact")
            freq = rel.get("contact_frequency_days")
            status = "healthy"
            if last_contact:
                if isinstance(last_contact, str):
                    last_contact = datetime.fromisoformat(last_contact.replace("Z", "+00:00"))
                delta_days = (today - last_contact).days
                if freq and delta_days > freq * 2:
                    status = "needs_attention"
                if freq and delta_days > freq * 4:
                    status = "critical"
                elif not freq and delta_days > 30:
                    status = "needs_attention"
                if not freq and delta_days > 90:
                    status = "critical"
            else:
                status = "no_contact"

            health_scores.append({
                "contact_name": rel.get("contact_name", "Unknown"),
                "contact_email": rel.get("contact_email"),
                "last_contact": last_contact.isoformat() if hasattr(last_contact, "isoformat") else last_contact,
                "days_since_contact": (today - last_contact).days if last_contact else None,
                "frequency_days": freq,
                "health_status": status,
                "importance_score": rel.get("importance_score", 0.5),
                "relationship_id": str(rel["_id"]),
            })
        return sorted(health_scores, key=lambda x: x.get("days_since_contact") or 999, reverse=True)

    async def suggest_gift(self, user_id: str, relationship_id: str) -> dict:
        db = get_db()
        rel = await db["user_relationships"].find_one({"_id": ObjectId(relationship_id)})
        if not rel:
            return {"error": "Relationship not found"}

        interests = rel.get("preferences", {}).get("gift_interests", [])
        past_gifts = rel.get("preferences", {}).get("last_gift_given", {})

        prompt = (
            f"Suggest a gift for {rel.get('contact_name', 'this person')}.\n"
            f"Relationship type: {rel.get('relationship_type', 'friend')}\n"
            f"Known interests: {interests}\n"
            f"Past gifts: {past_gifts}\n"
            f"Budget: reasonable\n"
            f"Return a structured gift recommendation with price range and reasoning."
        )

        schema = {
            "type": "object",
            "properties": {
                "suggestion": {"type": "string"},
                "price_range": {"type": "string"},
                "reasoning": {"type": "string"},
                "category": {"type": "string"},
                "confidence": {"type": "number"},
            },
            "required": ["suggestion", "price_range", "reasoning", "category", "confidence"],
        }

        result = await self.llm_service.generate_structured(prompt, schema)
        return result

    async def detect_social_events(self, user_id: str) -> list[dict]:
        db = get_db()
        events = await db["fivetran_calendar.events"].find(
            {"user_id": user_id}
        ).sort("start_time", -1).to_list(length=50)

        social_events = []
        for e in events:
            title = e.get("title", "").lower()
            attendees = e.get("attendees", [])
            if any(kw in title for kw in ["party", "birthday", "dinner", "celebration", "gathering", "wedding"]):
                social_events.append({
                    "event_id": e.get("id"),
                    "title": e.get("title"),
                    "date": e.get("start_time"),
                    "attendees": len(attendees) if attendees else 0,
                    "type": "social",
                })
            elif len(attendees) > 2:
                social_events.append({
                    "event_id": e.get("id"),
                    "title": e.get("title"),
                    "date": e.get("start_time"),
                    "attendees": len(attendees),
                    "type": "group_meeting",
                })
        return social_events[:20]
