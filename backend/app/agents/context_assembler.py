from typing import Optional
from app.services.memory_service import MemoryService
from app.services.search_service import SearchService
from app.services.analytics_service import AnalyticsService
from app.services.llm_service import LLMService


class ContextAssemblerAgent:
    def __init__(self):
        self.llm_service = LLMService()
        self.memory_service = MemoryService()
        self.search_service = SearchService()
        self.analytics_service = AnalyticsService()

    async def run(self, user_id: str, query: str, domains: Optional[list[str]] = None) -> dict:
        memories_task = self.memory_service.get_memories(user_id, limit=15)
        search_task = self.search_service.search_cross_domain(user_id, query, domains)
        trends_task = self.analytics_service.get_weekly_trends(user_id)

        memories, search_results, trends = await asyncio.gather(
            memories_task, search_task, trends_task
        )

        context = {
            "user_id": user_id,
            "query": query,
            "relevant_memories": memories,
            "cross_domain_results": search_results,
            "recent_trends": trends,
            "domains_queried": domains or [],
            "context_quality": self._assess_quality(memories, search_results),
        }
        return context

    def _assess_quality(self, memories: list, search_results: list) -> str:
        total = len(memories) + len(search_results)
        if total > 20:
            return "high"
        if total > 5:
            return "medium"
        return "low"

    async def enrich_context(self, context: dict) -> dict:
        if context["context_quality"] == "low":
            summary = await self.llm_service.summarize(
                f"User query: {context['query']}\nLimited data available. Suggest what additional data would help."
            )
            context["enrichment_suggestion"] = summary
        return context
