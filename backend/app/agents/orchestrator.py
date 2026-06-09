import asyncio
from typing import Optional
from app.services.llm_service import LLMService
from app.services.memory_service import MemoryService
from app.services.action_service import ActionService
from app.agents.query_planner import QueryPlannerAgent
from app.agents.context_assembler import ContextAssemblerAgent
from app.agents.brief_agent import BriefAgent
from app.agents.pattern_agent import PatternAgent
from app.agents.action_agent import ActionAgent


class OrchestratorAgent:
    def __init__(self):
        self.llm_service = LLMService()
        self.memory_service = MemoryService()
        self.action_service = ActionService()
        self.query_planner = QueryPlannerAgent()
        self.context_assembler = ContextAssemblerAgent()
        self.brief_agent = BriefAgent()
        self.pattern_agent = PatternAgent()
        self.action_agent = ActionAgent()

    async def process_query(self, user_id: str, query: str, trace_id: str) -> dict:
        plan = await self.query_planner.run(user_id, query)
        context = await self.context_assembler.run(user_id, query, plan.get("domains"))
        decision_id = await self.action_service.record_decision(user_id, trace_id, query)

        if plan.get("complexity") == "moderate" or plan.get("complexity") == "complex":
            context = await self.context_assembler.enrich_context(context)

        recommendation = await self.action_agent.recommend(user_id, context, query)
        await self.action_service.update_recommendation(decision_id, recommendation)

        memory = {
            "memory_type": "decision",
            "domain": plan.get("domains", ["general"])[0],
            "content": {"query": query, "recommendation": recommendation},
            "importance_score": 0.6,
            "tags": plan.get("domains", []),
        }
        from app.models.memory import MemoryCreate
        await self.memory_service.create_memory(user_id, MemoryCreate(**memory))

        return {
            "trace_id": trace_id,
            "decision_id": decision_id,
            "plan": plan,
            "context": {k: v for k, v in context.items() if k != "query"},
            "recommendation": recommendation,
        }

    async def generate_morning_brief(self, user_id: str) -> dict:
        from app.services.brief_service import BriefService
        brief_service = BriefService()
        context = await brief_service.build_context(user_id)
        brief = await self.brief_agent.run(context, "morning")
        brief["active_patterns"] = await self.pattern_agent.get_insights(user_id)
        return brief

    async def generate_evening_brief(self, user_id: str) -> dict:
        from app.services.brief_service import BriefService
        brief_service = BriefService()
        context = await brief_service.build_context(user_id)
        brief = await self.brief_agent.run(context, "evening")
        brief["pending_actions"] = await self.action_agent.get_scheduled_actions(user_id)
        return brief

    async def analyze_patterns(self, user_id: str) -> list[dict]:
        from app.services.brief_service import BriefService
        brief_service = BriefService()
        context = await brief_service.build_context(user_id)
        return await self.pattern_agent.analyze(user_id, context)

    async def get_insights(self, user_id: str) -> dict:
        patterns_task = self.pattern_agent.get_insights(user_id)
        decisions_task = self.action_service.get_decisions(user_id, 10)
        follow_through_task = self.action_service.get_follow_through_rate(user_id)

        patterns, decisions, follow_through = await asyncio.gather(
            patterns_task, decisions_task, follow_through_task
        )

        return {
            "active_patterns": patterns,
            "recent_decisions": [
                {"query": d["query"], "selected": d.get("recommendation", {}).get("recommended_option_id"),
                 "created_at": d.get("created_at")}
                for d in decisions
            ],
            "follow_through_rate": follow_through,
        }
