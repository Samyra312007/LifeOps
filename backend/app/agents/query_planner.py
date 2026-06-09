import asyncio
from typing import Optional
from app.services.llm_service import LLMService


class QueryPlannerAgent:
    def __init__(self):
        self.llm_service = LLMService()

    async def run(self, user_id: str, query: str) -> dict:
        plan_schema = {
            "type": "object",
            "properties": {
                "intent": {"type": "string", "enum": ["informational", "actionable", "reflective", "scheduling"]},
                "domains": {
                    "type": "array",
                    "items": {"type": "string", "enum": ["health", "finance", "social", "work", "general"]},
                },
                "sub_queries": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "question": {"type": "string"},
                            "domain": {"type": "string"},
                            "required_data_sources": {"type": "array", "items": {"type": "string"}},
                        },
                        "required": ["id", "question", "domain", "required_data_sources"],
                    },
                },
                "requires_cross_domain": {"type": "boolean"},
                "complexity": {"type": "string", "enum": ["simple", "moderate", "complex"]},
            },
            "required": ["intent", "domains", "sub_queries", "requires_cross_domain", "complexity"],
        }

        result = await self.llm_service.generate_structured(
            f"Analyze this user query and create an execution plan:\n\nUser ID: {user_id}\nQuery: {query}",
            plan_schema,
            "You are a query planning assistant for a personal LifeOps AI.",
        )
        return result
