from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.services.llm_service import LLMService
from app.services.action_executor import ActionExecutor


class DinnerPartyPlanner:
    def __init__(self):
        self.llm_service = LLMService()
        self.action_executor = ActionExecutor()

    async def plan_party(self, user_id: str, params: dict) -> dict:
        db = get_db()
        guest_list = params.get("guests", [])
        budget = params.get("budget", 200)
        date = params.get("date")
        dietary_prefs = params.get("dietary_preferences", [])

        guest_details = []
        for email in guest_list:
            rel = await db["user_relationships"].find_one({"user_id": user_id, "contact_email": email})
            if rel:
                guest_details.append({
                    "email": email,
                    "name": rel.get("contact_name", email),
                    "dietary": rel.get("preferences", {}).get("dietary_restrictions", []),
                    "gift_interests": rel.get("preferences", {}).get("gift_interests", []),
                })
            else:
                guest_details.append({"email": email, "name": email, "dietary": [], "gift_interests": []})

        past_parties = await db["user_memories"].find(
            {"user_id": user_id, "domain": "social", "tags": "party"}
        ).sort("created_at", -1).to_list(length=5)

        menu_prompt = (
            f"Plan a dinner party menu for {len(guest_details)} guests with budget ${budget}.\n"
            f"Dietary preferences: {dietary_prefs}\n"
            f"Guest dietary restrictions: {[g['dietary'] for g in guest_details if g['dietary']]}\n"
            f"Past parties context: {[m.get('content', {}) for m in past_parties]}\n"
            f"Return a structured menu with dishes, estimated costs, and prep timeline."
        )

        menu_schema = {
            "type": "object",
            "properties": {
                "appetizers": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "cost": {"type": "number"}, "prep_time_minutes": {"type": "integer"}}, "required": ["name", "cost", "prep_time_minutes"]}},
                "main_course": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "cost": {"type": "number"}, "prep_time_minutes": {"type": "integer"}}, "required": ["name", "cost", "prep_time_minutes"]}},
                "dessert": {"type": "object", "properties": {"name": {"type": "string"}, "cost": {"type": "number"}, "prep_time_minutes": {"type": "integer"}}, "required": ["name", "cost", "prep_time_minutes"]},
                "total_estimated_cost": {"type": "number"},
                "prep_timeline": {"type": "array", "items": {"type": "string"}},
                "shopping_list": {"type": "array", "items": {"type": "string"}},
            },
            "required": ["appetizers", "main_course", "dessert", "total_estimated_cost", "prep_timeline", "shopping_list"],
        }

        menu = await self.llm_service.generate_structured(menu_prompt, menu_schema)

        plan = {
            "date": date,
            "guests": guest_details,
            "budget": budget,
            "menu": menu,
            "total_cost": menu.get("total_estimated_cost", 0),
            "created_at": datetime.now(timezone.utc),
        }

        await self._save_plan(user_id, plan)
        return plan

    async def _save_plan(self, user_id: str, plan: dict):
        db = get_db()
        await db["user_memories"].insert_one({
            "user_id": user_id,
            "memory_type": "fact",
            "domain": "social",
            "content": {"title": "Dinner Party Plan", "description": f"Party on {plan['date']} for {len(plan['guests'])} guests", "details": plan},
            "importance_score": 0.7,
            "access_count": 0,
            "tags": ["party", "social", "planning"],
            "source_trace_ids": [],
            "created_at": datetime.now(timezone.utc),
            "last_accessed_at": datetime.now(timezone.utc),
        })
        if plan.get("date"):
            await self.action_executor.execute_action(user_id, "", "create_calendar_event", {
                "title": "Dinner Party",
                "description": f"Dinner party with {len(plan['guests'])} guests",
                "start_time": plan["date"],
                "end_time": plan["date"],
            })

    async def get_past_parties(self, user_id: str) -> list[dict]:
        db = get_db()
        cursor = db["user_memories"].find(
            {"user_id": user_id, "domain": "social", "tags": "party"}
        ).sort("created_at", -1).limit(20)
        return await cursor.to_list(length=20)
