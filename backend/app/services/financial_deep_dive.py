from datetime import datetime, timezone, timedelta
from typing import Optional
from bson import ObjectId
from app.core.database import get_db
from app.services.llm_service import LLMService


class FinancialDeepDive:
    def __init__(self):
        self.llm_service = LLMService()

    async def analyze_spending(self, user_id: str, days: int = 30) -> dict:
        db = get_db()
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        transactions = await db["fivetran_plaid.transactions"].find(
            {"user_id": user_id, "date": {"$gte": cutoff.strftime("%Y-%m-%d")}}
        ).sort("date", -1).to_list(length=200)

        if not transactions:
            return {"error": "No transaction data available", "has_data": False}

        category_totals = {}
        daily_spend = {}
        for t in transactions:
            cats = t.get("category", ["uncategorized"])
            cat = cats[0] if cats else "uncategorized"
            amount = abs(t.get("amount", 0))
            category_totals[cat] = category_totals.get(cat, 0) + amount
            day = t.get("date", "")[:10]
            daily_spend[day] = daily_spend.get(day, 0) + amount

        top_categories = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
        avg_daily = sum(daily_spend.values()) / max(len(daily_spend), 1)

        subscriptions = await self._audit_subscriptions(user_id)
        savings = await self._get_savings_progress(user_id)

        analysis = {
            "has_data": True,
            "period_days": days,
            "total_spend": sum(daily_spend.values()),
            "avg_daily_spend": round(avg_daily, 2),
            "top_categories": [{"category": c, "amount": round(a, 2)} for c, a in top_categories[:5]],
            "subscriptions": subscriptions,
            "savings": savings,
            "active_days": len(daily_spend),
        }

        what_if = await self._generate_what_if_scenarios(user_id, transactions, subscriptions)
        analysis["what_if_scenarios"] = what_if

        return analysis

    async def _audit_subscriptions(self, user_id: str) -> list[dict]:
        db = get_db()
        transactions = await db["fivetran_plaid.transactions"].find(
            {"user_id": user_id, "category": "Subscription"}
        ).sort("date", -1).to_list(length=50)

        if not transactions:
            return []

        subs = {}
        for t in transactions:
            name = t.get("merchant_name", "Unknown")
            amount = abs(t.get("amount", 0))
            if name not in subs:
                subs[name] = {"merchant": name, "monthly_cost": 0, "last_charge": t.get("date"), "charges": 0}
            subs[name]["monthly_cost"] += amount
            subs[name]["charges"] += 1

        sorted_subs = sorted(subs.values(), key=lambda x: x["monthly_cost"], reverse=True)
        total_monthly = sum(s["monthly_cost"] for s in sorted_subs)
        savings_ideas = []
        threshold = total_monthly * 0.15
        for s in sorted_subs:
            if s["monthly_cost"] >= threshold:
                savings_ideas.append({
                    "service": s["merchant"],
                    "monthly_cost": round(s["monthly_cost"], 2),
                    "annual_cost": round(s["monthly_cost"] * 12, 2),
                    "recommendation": "Consider canceling or downgrading" if s["monthly_cost"] > 50 else "Keep",
                })

        return {"subscriptions": sorted_subs, "total_monthly": round(total_monthly, 2), "savings_recommendations": savings_ideas}

    async def _get_savings_progress(self, user_id: str) -> dict:
        db = get_db()
        user = await db["users"].find_one({"_id": ObjectId(user_id) if isinstance(user_id, str) else user_id})
        if not user:
            return {"goals": [], "progress": []}
        goals = user.get("goals", [])
        savings_goals = [g for g in goals if g.get("domain") == "finance"]
        return {"goals": savings_goals}

    async def _generate_what_if_scenarios(self, user_id: str, transactions: list[dict], subscriptions: dict) -> list[dict]:
        if not transactions:
            return []

        monthly_subs = subscriptions.get("total_monthly", 0) if isinstance(subscriptions, dict) else 0
        scenarios = [
            {"scenario": f"Cancel top subscription", "monthly_savings": round(monthly_subs * 0.3, 2), "annual_savings": round(monthly_subs * 0.3 * 12, 2)},
            {"scenario": "Reduce dining out by 50%", "monthly_savings": 0, "annual_savings": 0},
        ]

        dining_total = sum(abs(t.get("amount", 0)) for t in transactions if "dining" in [c.lower() for c in t.get("category", [])])
        scenarios[1]["monthly_savings"] = round(dining_total * 0.5, 2)
        scenarios[1]["annual_savings"] = round(dining_total * 0.5 * 12, 2)

        return scenarios
