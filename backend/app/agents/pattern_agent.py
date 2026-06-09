from app.services.llm_service import LLMService
from app.services.pattern_service import PatternService


class PatternAgent:
    def __init__(self):
        self.llm_service = LLMService()
        self.pattern_service = PatternService()

    async def analyze(self, user_id: str, data: dict) -> list[dict]:
        schema = {
            "type": "object",
            "properties": {
                "patterns": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "pattern_type": {"type": "string"},
                            "confidence": {"type": "number"},
                            "description": {"type": "string"},
                            "domain": {"type": "string"},
                            "severity": {"type": "string"},
                            "suggested_interventions": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["pattern_type", "confidence", "description", "domain", "severity", "suggested_interventions"],
                    },
                }
            },
            "required": ["patterns"],
        }

        result = await self.llm_service.generate_structured(
            f"Analyze this user data for recurring life patterns:\n\n{data}",
            schema,
            "You are a behavioral pattern analysis assistant for a personal LifeOps AI.",
        )

        patterns = result.get("patterns", [])
        for p in patterns:
            await self.pattern_service.upsert_pattern(
                user_id, p["domain"], p["pattern_type"],
                {"confidence": p["confidence"], "pattern_signature": {"description": p["description"]}},
            )
        return patterns

    async def get_insights(self, user_id: str) -> list[dict]:
        active_patterns = await self.pattern_service.get_active_patterns(user_id)
        if not active_patterns:
            return []

        schema = {
            "type": "object",
            "properties": {
                "insights": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "insight": {"type": "string"},
                            "pattern_type": {"type": "string"},
                            "priority": {"type": "string"},
                            "actionable": {"type": "boolean"},
                        },
                        "required": ["insight", "pattern_type", "priority", "actionable"],
                    },
                }
            },
            "required": ["insights"],
        }

        result = await self.llm_service.generate_structured(
            f"Based on these active patterns, provide insights:\n\n{active_patterns}",
            schema,
            "You are a behavioral insight assistant.",
        )
        return result.get("insights", [])
