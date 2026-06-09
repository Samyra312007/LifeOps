from app.services.llm_service import LLMService
from app.services.action_service import ActionService


class ActionAgent:
    def __init__(self):
        self.llm_service = LLMService()
        self.action_service = ActionService()

    async def recommend(self, user_id: str, context: dict, query: str) -> dict:
        schema = {
            "type": "object",
            "properties": {
                "recommendation": {
                    "type": "object",
                    "properties": {
                        "summary": {"type": "string"},
                        "options": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "string"},
                                    "label": {"type": "string"},
                                    "action_type": {"type": "string"},
                                    "parameters": {"type": "object"},
                                    "pros": {"type": "array", "items": {"type": "string"}},
                                    "cons": {"type": "array", "items": {"type": "string"}},
                                },
                                "required": ["id", "label", "action_type", "pros", "cons"],
                            },
                        },
                        "recommended_option_id": {"type": "string"},
                        "reasoning": {"type": "string"},
                    },
                    "required": ["summary", "options", "recommended_option_id", "reasoning"],
                }
            },
            "required": ["recommendation"],
        }

        prompt = (
            f"Based on this user query and context, recommend actions:\n\n"
            f"Query: {query}\n\nContext:\n"
            f"- Active patterns: {[p.get('pattern_type') for p in context.get('active_patterns', [])]}\n"
            f"- Relevant memories: {[m.get('memory_type') for m in context.get('recent_memories', [])]}\n"
            f"- Daily summary available: {bool(context.get('daily_summary'))}"
        )

        result = await self.llm_service.generate_structured(
            prompt, schema,
            "You are an action recommendation assistant for a personal LifeOps AI.",
        )
        return result.get("recommendation", {})

    async def get_scheduled_actions(self, user_id: str) -> list[dict]:
        decisions = await self.action_service.get_decisions(user_id, 10)
        actions = []
        for d in decisions:
            if d.get("user_action") and d["user_action"].get("was_followed_through") == False:
                actions.append({
                    "decision_id": str(d["_id"]),
                    "query": d["query"],
                    "recommendation": d.get("recommendation", {}).get("summary", ""),
                    "status": "pending",
                })
        return actions
