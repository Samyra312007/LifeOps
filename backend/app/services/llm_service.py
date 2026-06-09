from typing import Optional
from app.config import settings
import google.generativeai as genai


class LLMService:
    def __init__(self):
        self.model = None
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model)

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.model:
            return "LLM not configured. Set GEMINI_API_KEY."
        generation_config = genai.types.GenerationConfig(
            temperature=0.2,
            top_p=0.95,
            top_k=40,
        )
        contents = [prompt]
        if system_instruction:
            contents.insert(0, system_instruction)
        response = await self.model.generate_content_async(
            contents,
            generation_config=generation_config,
        )
        return response.text

    async def generate_structured(self, prompt: str, schema: dict, system_instruction: Optional[str] = None) -> dict:
        if not self.model:
            return {"error": "LLM not configured"}
        generation_config = genai.types.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json",
            response_schema=schema,
        )
        contents = [prompt]
        if system_instruction:
            contents.insert(0, system_instruction)
        response = await self.model.generate_content_async(
            contents,
            generation_config=generation_config,
        )
        return response.parsed

    async def embed(self, text: str) -> list[float]:
        if not self.model:
            return []
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]

    async def summarize(self, text: str, max_length: int = 200) -> str:
        prompt = f"Summarize the following in at most {max_length} words:\n\n{text}"
        return await self.generate(prompt)

    async def classify_mood(self, text: str) -> dict:
        schema = {
            "type": "object",
            "properties": {
                "mood": {"type": "string", "enum": ["positive", "neutral", "negative", "anxious", "tired"]},
                "confidence": {"type": "number"},
                "reasoning": {"type": "string"},
            },
            "required": ["mood", "confidence", "reasoning"],
        }
        return await self.generate_structured(
            f"Classify the mood of this text:\n\n{text}",
            schema,
            "You are a helpful emotional analysis assistant.",
        )

    async def extract_insights(self, data: str) -> list[dict]:
        schema = {
            "type": "object",
            "properties": {
                "insights": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "description": {"type": "string"},
                            "category": {"type": "string"},
                            "confidence": {"type": "number"},
                        },
                        "required": ["title", "description", "category", "confidence"],
                    },
                }
            },
            "required": ["insights"],
        }
        result = await self.generate_structured(
            f"Extract key insights from the following data:\n\n{data}",
            schema,
            "You are a data analysis assistant that identifies patterns and insights.",
        )
        return result.get("insights", [])
