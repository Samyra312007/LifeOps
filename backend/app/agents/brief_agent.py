from app.services.llm_service import LLMService


class BriefAgent:
    def __init__(self):
        self.llm_service = LLMService()

    async def run(self, context: dict, brief_type: str = "morning") -> dict:
        prompt = f"""
Generate a {brief_type} brief for the user based on this context:

Daily Summary: {context.get('daily_summary', {})}
Active Patterns: {[p.get('pattern_type') for p in context.get('active_patterns', [])]}
Recent Memories: {[m.get('memory_type') for m in context.get('recent_memories', [])]}
        """

        if brief_type == "morning":
            prompt += "\nFocus on: what happened yesterday, today's priorities, and suggested first action."
        else:
            prompt += "\nFocus on: what was accomplished, what drained energy, and tomorrow's preparation."

        sections = {
            "type": "object",
            "properties": {
                "sections": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "id": {"type": "string"},
                            "title": {"type": "string"},
                            "content": {"type": "string"},
                            "priority": {"type": "integer"},
                        },
                        "required": ["id", "title", "content", "priority"],
                    },
                }
            },
            "required": ["sections"],
        }

        result = await self.llm_service.generate_structured(prompt, sections)
        return {
            "type": brief_type,
            "date": context.get("date"),
            "sections": result.get("sections", []),
        }
