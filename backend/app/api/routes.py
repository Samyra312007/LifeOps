from fastapi import APIRouter, Depends, HTTPException, Query
from app.core.auth import get_current_user, hash_password, verify_password, create_access_token
from app.core.database import get_db
from app.models.user import UserCreate, UserResponse
from app.models.alert import AlertLogCreate
from app.agents.orchestrator import OrchestratorAgent
from app.tracing.instrument import TracingService
from app.services.action_executor import ActionExecutor
from app.services.connector_service import ConnectorService
from app.services.alert_service import AlertEngine
from app.services.fivetran_service import FivetranService
from app.services.scheduling_service import SchedulingService
from app.services.pattern_detector import PatternDetector
from app.services.safety_service import SafetyFilter, HallucinationGuard
from app.services.dinner_party_planner import DinnerPartyPlanner
from app.services.financial_deep_dive import FinancialDeepDive
from app.services.social_tracker import SocialCommitmentTracker
from app.services.gdpr_service import GDPRService
from bson import ObjectId
from datetime import datetime, timezone

router = APIRouter()
orchestrator = OrchestratorAgent()
tracing = TracingService()
action_executor = ActionExecutor()
connector_service = ConnectorService()
alert_engine = AlertEngine()
fivetran_service = FivetranService()
scheduling_service = SchedulingService()
pattern_detector = PatternDetector()
hallucination_guard = HallucinationGuard()


# ─── Auth ───────────────────────────────────────────────────────

@router.post("/auth/register")
async def register(data: UserCreate):
    db = get_db()
    existing = await db["users"].find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user_doc = {
        "email": data.email,
        "display_name": data.display_name,
        "hashed_password": hash_password(data.password),
        "timezone": data.timezone,
        "wake_time": "07:00",
        "bed_time": "23:00",
        "onboarding_completed": False,
        "goals": [],
        "preferences": {},
        "data_connectors": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db["users"].insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id), "email": data.email})
    return {"access_token": token, "token_type": "bearer", "user_id": str(result.inserted_id)}


@router.post("/auth/login")
async def login(email: str, password: str):
    db = get_db()
    user = await db["users"].find_one({"email": email})
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return {"access_token": token, "token_type": "bearer", "user_id": str(user["_id"])}


@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db["users"].find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user.pop("_id"))
    user.pop("hashed_password", None)
    return user


# ─── Query ──────────────────────────────────────────────────────

@router.post("/query")
async def process_query(
    query: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    trace_id = tracing.get_trace_id()
    user_id = current_user["sub"]

    # Safety filter on input
    safe_check = SafetyFilter.validate_safe(query)
    if not safe_check["is_safe"]:
        return {"response": "I can't help with that request.", "trace_id": trace_id, "blocked": True}

    result = await orchestrator.process_query(user_id, query, trace_id)

    # Hallucination guard on output
    recommendation_text = result.get("recommendation", {}).get("summary", "")
    context_items = result.get("context", {}).get("relevant_memories", [])
    grounding = await hallucination_guard.verify_grounding(recommendation_text, context_items)
    if not grounding.get("is_grounded", True):
        result["recommendation"]["summary"] = await hallucination_guard.get_fallback_response(query)
        result["recommendation"]["grounding_issue"] = grounding.get("unsupported_claims", [])

    result["trace_id"] = trace_id
    return result


# ─── Execute (Action Execution) ─────────────────────────────────

@router.post("/execute")
async def execute_action(
    trace_id: str = Query(...),
    action_id: str = Query(...),
    parameters: dict = {},
    current_user: dict = Depends(get_current_user),
):
    result = await action_executor.execute_action(
        current_user["sub"], trace_id, action_id, parameters,
    )
    return {"status": result.get("status", "completed"), "result": result, "trace_id": trace_id}


# ─── Brief ──────────────────────────────────────────────────────

@router.get("/brief/morning")
async def morning_brief(current_user: dict = Depends(get_current_user)):
    return await orchestrator.generate_morning_brief(current_user["sub"])


@router.get("/brief/evening")
async def evening_brief(current_user: dict = Depends(get_current_user)):
    return await orchestrator.generate_evening_brief(current_user["sub"])


# ─── Insights ───────────────────────────────────────────────────

@router.get("/insights")
async def get_insights(current_user: dict = Depends(get_current_user)):
    return await orchestrator.get_insights(current_user["sub"])


@router.get("/insights/patterns")
async def analyze_patterns(current_user: dict = Depends(get_current_user)):
    return await orchestrator.analyze_patterns(current_user["sub"])


@router.post("/insights/scan")
async def scan_patterns(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["sub"]
    data = {}
    sleep_data = await db["fivetran_fit.sleep_sessions"].find({"user_id": user_id}).sort("date", -1).to_list(length=14)
    if sleep_data:
        data["sleep_data"] = sleep_data
    transactions = await db["fivetran_plaid.transactions"].find({"user_id": user_id}).sort("date", -1).to_list(length=30)
    if transactions:
        data["transactions"] = transactions
    activities = await db["fivetran_strava.activities"].find({"user_id": user_id}).sort("start_date", -1).to_list(length=10)
    if activities:
        data["activities"] = activities
    events = await db["fivetran_calendar.events"].find({"user_id": user_id}).sort("start_time", -1).to_list(length=20)
    if events:
        data["events"] = events
    detections = await pattern_detector.run_all_detections(user_id, data)
    await pattern_detector.alert_for_patterns(user_id, detections)
    return {"detections": detections, "count": len(detections)}


# ─── Actions ────────────────────────────────────────────────────

@router.get("/actions")
async def get_actions(current_user: dict = Depends(get_current_user)):
    from app.services.action_service import ActionService
    svc = ActionService()
    decisions = await svc.get_decisions(current_user["sub"], 20)
    return [
        {
            "id": str(d["_id"]),
            "query": d["query"],
            "recommendation": d.get("recommendation", {}).get("summary", ""),
            "selected_option": d.get("user_action", {}).get("selected_option_id"),
            "followed_through": d.get("user_action", {}).get("was_followed_through"),
            "created_at": d.get("created_at"),
        }
        for d in decisions
    ]


@router.post("/actions/{decision_id}/feedback")
async def action_feedback(
    decision_id: str,
    was_followed_through: bool = Query(...),
    quality_score: float = None,
    current_user: dict = Depends(get_current_user),
):
    from app.services.action_service import ActionService
    svc = ActionService()
    await svc.log_user_action(decision_id, {
        "selected_option_id": None,
        "confirmed_at": datetime.now(timezone.utc),
        "was_followed_through": was_followed_through,
    })
    if quality_score is not None:
        db = get_db()
        await db["user_decisions"].update_one(
            {"_id": ObjectId(decision_id)},
            {"$set": {"outcome.quality_score": quality_score}},
        )
    return {"status": "ok"}


# ─── Patterns ───────────────────────────────────────────────────

@router.get("/patterns")
async def get_patterns(current_user: dict = Depends(get_current_user)):
    from app.services.pattern_service import PatternService
    svc = PatternService()
    return await svc.get_all_patterns(current_user["sub"])


# ─── Alerts ─────────────────────────────────────────────────────

@router.get("/alerts")
async def get_alerts(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
):
    alerts = await alert_engine.get_alerts(current_user["sub"], unread_only)
    count = await alert_engine.get_unread_count(current_user["sub"])
    return {"alerts": alerts, "unread_count": count}


@router.post("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: str, current_user: dict = Depends(get_current_user)):
    await alert_engine.mark_read(alert_id)
    return {"status": "ok"}


@router.post("/alerts/{alert_id}/respond")
async def respond_to_alert(
    alert_id: str,
    action: str = Query(...),
    action_id: str = None,
    current_user: dict = Depends(get_current_user),
):
    await alert_engine.record_response(alert_id, action, action_id)
    return {"status": "ok"}


# ─── Connectors ─────────────────────────────────────────────────

@router.get("/connectors")
async def list_connectors(current_user: dict = Depends(get_current_user)):
    return await connector_service.get_connectors(current_user["sub"])


@router.post("/connectors/register")
async def register_connector(
    source: str = Query(...),
    oauth_token: str = None,
    current_user: dict = Depends(get_current_user),
):
    if source not in ConnectorService.get_available_sources():
        raise HTTPException(status_code=400, detail=f"Unsupported source. Available: {ConnectorService.get_available_sources()}")
    connector_id = await connector_service.register_connector(
        current_user["sub"], source,
        {"access_token": oauth_token} if oauth_token else None,
    )
    return {"id": connector_id, "source": source, "status": "active"}


@router.post("/connectors/{connector_id}/sync")
async def sync_connector(connector_id: str, current_user: dict = Depends(get_current_user)):
    connector = await connector_service.get_connector(connector_id)
    if not connector:
        raise HTTPException(status_code=404, detail="Connector not found")
    # Stub: in production this would trigger a Fivetran sync or direct API pull
    await connector_service.update_sync_status(connector_id, "completed")
    return {"status": "completed", "connector_id": connector_id, "records_synced": 0}


@router.delete("/connectors/{connector_id}")
async def disconnect_connector(connector_id: str, current_user: dict = Depends(get_current_user)):
    await connector_service.disconnect(connector_id)
    return {"status": "disconnected"}


@router.get("/connectors/sources")
async def list_available_sources():
    return {"sources": ConnectorService.get_available_sources()}


# ─── Fivetran Webhook ───────────────────────────────────────────

@router.post("/fivetran/webhook")
async def fivetran_webhook(payload: dict):
    return await fivetran_service.handle_sync_complete(payload)


@router.get("/connectors/sync-history")
async def sync_history(current_user: dict = Depends(get_current_user)):
    return await fivetran_service.get_sync_history(current_user["sub"])


# ─── Social / Relationships ─────────────────────────────────────

@router.get("/social/relationships")
async def get_relationships(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db["user_relationships"].find({"user_id": current_user["sub"]})
    relationships = await cursor.to_list(length=100)
    for r in relationships:
        r["id"] = str(r.pop("_id"))
    return relationships


@router.post("/social/relationships")
async def add_relationship(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = {
        "user_id": current_user["sub"],
        "contact_email": data["contact_email"],
        "contact_name": data["contact_name"],
        "relationship_type": data.get("relationship_type", "friend"),
        "important_dates": data.get("important_dates", []),
        "preferences": data.get("preferences", {}),
        "interaction_history": [],
        "last_contact": None,
        "contact_frequency_days": None,
        "importance_score": data.get("importance_score", 0.5),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db["user_relationships"].insert_one(doc)
    return {"id": str(result.inserted_id)}


@router.delete("/social/relationships/{relationship_id}")
async def delete_relationship(relationship_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    await db["user_relationships"].delete_one({"_id": ObjectId(relationship_id), "user_id": current_user["sub"]})
    return {"status": "deleted"}


@router.post("/social/relationships/{relationship_id}/interaction")
async def log_interaction(
    relationship_id: str,
    interaction: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    interaction["date"] = datetime.now(timezone.utc)
    await db["user_relationships"].update_one(
        {"_id": ObjectId(relationship_id)},
        {"$push": {"interaction_history": interaction}, "$set": {"last_contact": datetime.now(timezone.utc)}},
    )
    return {"status": "ok"}


# ─── Analytics ──────────────────────────────────────────────────

@router.get("/analytics/trends")
async def get_trends(days: int = 14, current_user: dict = Depends(get_current_user)):
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService()
    return await svc.get_weekly_trends(current_user["sub"], days)


@router.get("/analytics/daily-summary")
async def daily_summary(date: str = None, current_user: dict = Depends(get_current_user)):
    from app.services.analytics_service import AnalyticsService
    svc = AnalyticsService()
    return await svc.get_daily_summary(current_user["sub"], date)


# ─── Onboarding ─────────────────────────────────────────────────

@router.post("/onboarding/complete")
async def complete_onboarding(data: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    wake = data.get("wake_time", "07:00")
    bed = data.get("bed_time", "23:00")
    await db["users"].update_one(
        {"_id": ObjectId(current_user["sub"])},
        {
            "$set": {
                "onboarding_completed": True,
                "goals": data.get("goals", []),
                "preferences": data.get("preferences", {}),
                "data_connectors": data.get("data_connectors", []),
                "wake_time": wake,
                "bed_time": bed,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    await scheduling_service.setup_default_brief_schedules(current_user["sub"], wake, bed)
    for source in data.get("data_connectors", []):
        if isinstance(source, str):
            await connector_service.register_connector(current_user["sub"], source)
    return {"status": "ok"}


@router.get("/onboarding/schedules")
async def get_schedules(current_user: dict = Depends(get_current_user)):
    return await scheduling_service.get_user_schedules(current_user["sub"])


# ─── Self-Improvement ───────────────────────────────────────────

@router.get("/self-improve/evaluation")
async def self_improve_evaluation(current_user: dict = Depends(get_current_user)):
    from app.services.self_improve_service import SelfImproveService
    svc = SelfImproveService()
    quality = await svc.evaluate_decision_quality(current_user["sub"])
    suggestions = await svc.get_improvement_suggestions(current_user["sub"])
    return {"decision_quality": quality, "suggestions": suggestions}


@router.post("/self-improve/prune")
async def prune_memories(max_age_days: int = 90, current_user: dict = Depends(get_current_user)):
    from app.services.self_improve_service import SelfImproveService
    svc = SelfImproveService()
    return await svc.prune_stale_memories(current_user["sub"], max_age_days)


# ─── Dinner Party Planner ──────────────────────────────────────

@router.post("/features/dinner-party/plan")
async def plan_dinner_party(
    guests: list[str] = Query(...),
    budget: float = 200,
    date: str = None,
    dietary_preferences: list[str] = Query(default=[]),
    current_user: dict = Depends(get_current_user),
):
    planner = DinnerPartyPlanner()
    result = await planner.plan_party(current_user["sub"], {
        "guests": guests,
        "budget": budget,
        "date": date,
        "dietary_preferences": dietary_preferences,
    })
    return result


@router.get("/features/dinner-party/history")
async def party_history(current_user: dict = Depends(get_current_user)):
    planner = DinnerPartyPlanner()
    return await planner.get_past_parties(current_user["sub"])


# ─── Financial Deep-Dive ────────────────────────────────────────

@router.get("/features/financial/analysis")
async def financial_analysis(days: int = 30, current_user: dict = Depends(get_current_user)):
    fdd = FinancialDeepDive()
    return await fdd.analyze_spending(current_user["sub"], days)


@router.get("/features/financial/subscriptions")
async def subscription_audit(current_user: dict = Depends(get_current_user)):
    fdd = FinancialDeepDive()
    return await fdd._audit_subscriptions(current_user["sub"])


# ─── Social Commitment Tracking ─────────────────────────────────

@router.get("/features/social/birthdays")
async def upcoming_birthdays(current_user: dict = Depends(get_current_user)):
    tracker = SocialCommitmentTracker()
    return await tracker.detect_birthdays(current_user["sub"])


@router.get("/features/social/relationship-health")
async def relationship_health(current_user: dict = Depends(get_current_user)):
    tracker = SocialCommitmentTracker()
    return await tracker.get_relationship_health(current_user["sub"])


@router.get("/features/social/gift-suggestions/{relationship_id}")
async def gift_suggestion(relationship_id: str, current_user: dict = Depends(get_current_user)):
    tracker = SocialCommitmentTracker()
    return await tracker.suggest_gift(current_user["sub"], relationship_id)


@router.get("/features/social/events")
async def social_events(current_user: dict = Depends(get_current_user)):
    tracker = SocialCommitmentTracker()
    return await tracker.detect_social_events(current_user["sub"])


# ─── GDPR Compliance ────────────────────────────────────────────

@router.get("/gdpr/export")
async def export_data(current_user: dict = Depends(get_current_user)):
    gdpr = GDPRService()
    return await gdpr.export_user_data(current_user["sub"])


@router.delete("/gdpr/delete")
async def delete_data(current_user: dict = Depends(get_current_user)):
    gdpr = GDPRService()
    return await gdpr.delete_user_data(current_user["sub"])


# ─── Admin ──────────────────────────────────────────────────────

@router.get("/admin/health")
async def health():
    from app.core.database import get_db
    db = get_db()
    try:
        await db.command("ping")
        es_status = "unknown"
        try:
            from app.core.search import get_es
            es = get_es()
            await es.info()
            es_status = "connected"
        except Exception:
            es_status = "disconnected"
        return {"status": "healthy", "database": "connected", "elasticsearch": es_status}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@router.get("/admin/routes")
async def list_routes():
    routes = []
    for route in router.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            for method in route.methods:
                if method != "HEAD":
                    routes.append({"method": method, "path": route.path})
    return {"routes": sorted(routes, key=lambda r: r["path"])}
