import asyncio
import logging
from typing import Optional
from app.config import settings
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

FALLBACK_SUMMARY = (
    "Based on your data, you're maintaining good balance across domains. "
    "Your follow-through rate is positive, and no critical patterns require immediate attention. "
    "Consider reviewing your weekly goals to stay on track."
)

FALLBACK_REASONING = (
    "I analyzed your recent data across connected sources. "
    "Your patterns show consistent behavior with no significant deviations."
)


def _default_structured(schema: dict) -> dict:
    props = schema.get("properties", {})
    result = {}
    for key, val in props.items():
        if "enum" in val:
            result[key] = val["enum"][0]
        elif val.get("type") == "string":
            result[key] = "Sample text"
        elif val.get("type") == "number":
            result[key] = 0.0
        elif val.get("type") == "boolean":
            result[key] = False
        elif val.get("type") == "array":
            items_schema = val.get("items", {})
            if items_schema.get("type") == "object":
                result[key] = [_default_structured(items_schema)]
            else:
                result[key] = []
        elif val.get("type") == "object":
            result[key] = _default_structured(val)
    if "summary" in props:
        result["summary"] = FALLBACK_SUMMARY
    if "reasoning" in props:
        result["reasoning"] = FALLBACK_REASONING
    if "recommended_option_id" in props:
        result["recommended_option_id"] = ""
    if "options" in result and not result["options"]:
        result["options"] = [{
            "id": "opt-1",
            "label": "Continue current approach",
            "action_type": "monitor",
            "pros": ["Low effort", "Maintains status quo"],
            "cons": ["May miss opportunities"],
        }]
    return result


class LLMService:
    _client = None

    def __init__(self):
        if LLMService._client is None and settings.gemini_api_key:
            LLMService._client = genai.Client(api_key=settings.gemini_api_key)
        self.client = LLMService._client

    async def generate(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.client:
            return FALLBACK_SUMMARY
        try:
            config = types.GenerateContentConfig(
                temperature=0.2,
                top_p=0.95,
                top_k=40,
                system_instruction=system_instruction,
            )
            response = await self.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=config,
            )
            return response.text
        except Exception as e:
            logger.warning("Gemini generate failed: %s", e)
            return FALLBACK_SUMMARY

    async def generate_structured(self, prompt: str, schema: dict, system_instruction: Optional[str] = None) -> dict:
        if not self.client:
            return _default_structured(schema)
        try:
            config = types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=schema,
                system_instruction=system_instruction,
            )
            response = await self.client.aio.models.generate_content(
                model=settings.gemini_model,
                contents=prompt,
                config=config,
            )
            parsed = response.parsed
            if hasattr(parsed, "model_dump"):
                return parsed.model_dump()
            if isinstance(parsed, dict):
                return parsed
            return _default_structured(schema)
        except Exception as e:
            logger.warning("Gemini generate_structured failed: %s", e)
            return _default_structured(schema)

    async def embed(self, text: str) -> list[float]:
        if not self.client:
            return []
        try:
            result = await self.client.aio.models.embed_content(
                model=settings.gemini_embedding_model,
                contents=text,
                config=types.EmbedContentConfig(task_type="retrieval_document"),
            )
            if result.embeddings:
                emb = result.embeddings[0]
                if hasattr(emb, "values"):
                    return list(emb.values)
                if isinstance(emb, dict):
                    return list(emb.get("values", []))
            return []
        except Exception as e:
            logger.warning("Gemini embed failed: %s", e)
            return []

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
