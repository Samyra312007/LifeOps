import secrets
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
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
from app.services.google_service import GoogleOAuthService
from app.services.google_fit_service import GoogleFitService
from app.services.plaid_service import PlaidService
from app.services.fitbit_service import FitbitService
from app.services.todoist_service import TodoistService
from app.services.github_service import GitHubService
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
FRONTEND_URL = "http://localhost:5173"

google_oauth = GoogleOAuthService()
google_fit = GoogleFitService()
plaid_service = PlaidService()
fitbit_oauth = FitbitService()
todoist_oauth = TodoistService()
github_oauth = GitHubService()


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
async def login(data: dict):
    db = get_db()
    email = data.get("email", "")
    password = data.get("password", "")
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


@router.put("/auth/me")
async def update_me(
    data: dict,
    current_user: dict = Depends(get_current_user),
):
    db = get_db()
    allowed = {"display_name", "timezone", "wake_time", "bed_time", "preferences"}
    update = {k: v for k, v in data.items() if k in allowed and v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    update["updated_at"] = datetime.now(timezone.utc)
    result = await db["users"].update_one(
        {"_id": ObjectId(current_user["sub"])},
        {"$set": update},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    user = await db["users"].find_one({"_id": ObjectId(current_user["sub"])})
    user["id"] = str(user.pop("_id"))
    user.pop("hashed_password", None)
    return user


# ─── Google OAuth ────────────────────────────────────────────────

@router.get("/auth/oauth/google")
async def google_oauth_authorize(current_user: dict = Depends(get_current_user)):
    state = secrets.token_urlsafe(32)
    await connector_service.store_oauth_state(current_user["sub"], "google", state)
    auth_url = google_oauth.get_auth_url(state)
    return {"authorization_url": auth_url}


@router.get("/auth/oauth/google/callback")
async def google_oauth_callback(code: str, state: str, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=oauth_denied")
    state_data = await connector_service.validate_oauth_state(state)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=expired_state")
    tokens = await google_oauth.exchange_code(code)
    user_email = await google_oauth.get_user_email(tokens["access_token"])
    token_payload = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token", ""),
        "expires_at": datetime.now(timezone.utc).timestamp() + tokens.get("expires_in", 3600),
        "scope": tokens.get("scope", ""),
        "email": user_email,
    }
    await connector_service.register_connector(state_data["user_id"], "calendar", token_payload)
    await connector_service.register_connector(state_data["user_id"], "gmail", token_payload)
    return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=success&source=calendar+gmail")


# ─── Plaid OAuth ──────────────────────────────────────────────────

@router.post("/auth/plaid/link-token")
async def plaid_create_link_token(current_user: dict = Depends(get_current_user)):
    result = await plaid_service.create_link_token(current_user["sub"])
    return {"link_token": result.get("link_token")}


@router.post("/auth/plaid/exchange")
async def plaid_exchange_public_token(public_token: str = Query(...), current_user: dict = Depends(get_current_user)):
    tokens = await plaid_service.exchange_public_token(public_token)
    token_payload = {
        "access_token": tokens.get("access_token"),
        "item_id": tokens.get("item_id"),
    }
    await connector_service.register_connector(current_user["sub"], "plaid", token_payload)
    return {"status": "success"}


# ─── Fitbit OAuth ─────────────────────────────────────────────────

@router.get("/auth/oauth/fitbit")
async def fitbit_oauth_authorize(current_user: dict = Depends(get_current_user)):
    state = secrets.token_urlsafe(32)
    await connector_service.store_oauth_state(current_user["sub"], "fitbit", state)
    auth_url = fitbit_oauth.get_auth_url(state)
    return {"authorization_url": auth_url}


@router.get("/auth/oauth/fitbit/callback")
async def fitbit_oauth_callback(code: str, state: str, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=oauth_denied")
    state_data = await connector_service.validate_oauth_state(state)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=expired_state")
    tokens = await fitbit_oauth.exchange_code(code)
    token_payload = {
        "access_token": tokens.get("access_token"),
        "refresh_token": tokens.get("refresh_token", ""),
        "expires_at": datetime.now(timezone.utc).timestamp() + tokens.get("expires_in", 28800),
        "scope": tokens.get("scope", ""),
    }
    await connector_service.register_connector(state_data["user_id"], "fit", token_payload)
    return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=success&source=fit")


# ─── Google Fit OAuth ──────────────────────────────────────────────

@router.get("/auth/oauth/googlefit")
async def google_fit_authorize(current_user: dict = Depends(get_current_user)):
    state = secrets.token_urlsafe(32)
    await connector_service.store_oauth_state(current_user["sub"], "googlefit", state)
    auth_url = google_fit.get_auth_url(state)
    return {"authorization_url": auth_url}


@router.get("/auth/oauth/googlefit/callback")
async def google_fit_callback(code: str, state: str, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=oauth_denied")
    state_data = await connector_service.validate_oauth_state(state)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=expired_state")
    tokens = await google_fit.exchange_code(code)
    user_email = await google_fit.get_user_email(tokens["access_token"])
    token_payload = {
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token", ""),
        "expires_at": datetime.now(timezone.utc).timestamp() + tokens.get("expires_in", 3600),
        "scope": tokens.get("scope", ""),
        "email": user_email,
    }
    await connector_service.register_connector(state_data["user_id"], "fit", token_payload)
    return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=success&source=googlefit")


# ─── Todoist OAuth ────────────────────────────────────────────────

@router.get("/auth/oauth/todoist")
async def todoist_oauth_authorize(current_user: dict = Depends(get_current_user)):
    state = secrets.token_urlsafe(32)
    await connector_service.store_oauth_state(current_user["sub"], "todoist", state)
    auth_url = todoist_oauth.get_auth_url(state)
    return {"authorization_url": auth_url}


@router.get("/auth/oauth/todoist/callback")
async def todoist_oauth_callback(code: str, state: str, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=oauth_denied")
    state_data = await connector_service.validate_oauth_state(state)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=expired_state")
    tokens = await todoist_oauth.exchange_code(code)
    token_payload = {
        "access_token": tokens.get("access_token"),
        "scope": tokens.get("scope", ""),
    }
    await connector_service.register_connector(state_data["user_id"], "todoist", token_payload)
    return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=success&source=todoist")


# ─── GitHub OAuth ─────────────────────────────────────────────────

@router.get("/auth/oauth/github")
async def github_oauth_authorize(current_user: dict = Depends(get_current_user)):
    state = secrets.token_urlsafe(32)
    await connector_service.store_oauth_state(current_user["sub"], "github", state)
    auth_url = github_oauth.get_auth_url(state)
    return {"authorization_url": auth_url}


@router.get("/auth/oauth/github/callback")
async def github_oauth_callback(code: str, state: str, error: str = None):
    if error:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=oauth_denied")
    state_data = await connector_service.validate_oauth_state(state)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=error&message=expired_state")
    tokens = await github_oauth.exchange_code(code)
    token_payload = {
        "access_token": tokens.get("access_token"),
        "scope": tokens.get("scope", ""),
    }
    await connector_service.register_connector(state_data["user_id"], "github", token_payload)
    return RedirectResponse(f"{FRONTEND_URL}/connect-sources?status=success&source=github")


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
    from app.models.decision import UserAction
    from app.services.action_service import ActionService
    svc = ActionService()
    action = UserAction(
        selected_option_id=None,
        confirmed_at=datetime.now(timezone.utc),
        was_followed_through=was_followed_through,
    )
    await svc.log_user_action(decision_id, action)
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
    source = connector.get("source", "")
    oauth = connector.get("oauth_tokens", {})
    db = get_db()
    records_synced = 0

    access_token = oauth.get("access_token", "")
    has_real_token = bool(access_token) and access_token != "None"

    if has_real_token and source == "calendar":
        try:
            token = await google_oauth.ensure_valid_token(oauth)
            events = await google_oauth.fetch_calendar_events(token)
            for ev in events:
                start = ev.get("start", {})
                end = ev.get("end", {})
                await db["fivetran_calendar.events"].update_one(
                    {"user_id": current_user["sub"], "google_id": ev["id"]},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "google_id": ev["id"],
                        "title": ev.get("summary", ""),
                        "start_time": start.get("dateTime", start.get("date")),
                        "end_time": end.get("dateTime", end.get("date")),
                        "source": "calendar",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    elif has_real_token and source == "gmail":
        try:
            token = await google_oauth.ensure_valid_token(oauth)
            emails = await google_oauth.fetch_gmail_messages(token)
            for msg in emails:
                headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
                await db["fivetran_gmail.messages"].update_one(
                    {"user_id": current_user["sub"], "google_id": msg["id"]},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "google_id": msg["id"],
                        "subject": headers.get("Subject", "(no subject)"),
                        "from": headers.get("From", ""),
                        "received_at": headers.get("Date", ""),
                        "source": "gmail",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    elif has_real_token and source == "plaid":
        try:
            txns = await plaid_service.fetch_transactions(access_token)
            for tx in txns:
                await db["fivetran_plaid.transactions"].update_one(
                    {"user_id": current_user["sub"], "transaction_id": tx.get("transaction_id")},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "transaction_id": tx.get("transaction_id"),
                        "date": tx.get("date"),
                        "amount": tx.get("amount"),
                        "merchant": tx.get("merchant_name", tx.get("name")),
                        "category": (tx.get("category") or [None])[0],
                        "source": "plaid",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    elif has_real_token and source == "fit":
        try:
            activity = await fitbit_oauth.fetch_activity(access_token)
            for day in activity:
                summary = day.get("summary", {})
                await db["fivetran_fit.daily_summary"].update_one(
                    {"user_id": current_user["sub"], "date": day.get("date")},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "date": day.get("date"),
                        "steps": summary.get("steps", 0),
                        "sleep_hours": summary.get("sleep", {}).get("totalMinutesAsleep", 0) / 60.0 if summary.get("sleep") else 0,
                        "resting_heart_rate": summary.get("restingHeartRate", 0),
                        "source": "fit",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    elif has_real_token and source == "todoist":
        try:
            tasks = await todoist_oauth.fetch_tasks(access_token)
            for task in tasks:
                await db["fivetran_todoist.tasks"].update_one(
                    {"user_id": current_user["sub"], "todoist_id": task["id"]},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "todoist_id": task["id"],
                        "content": task.get("content"),
                        "due": task.get("due", {}).get("date") if task.get("due") else None,
                        "priority": task.get("priority", 1),
                        "source": "todoist",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    elif has_real_token and source == "github":
        try:
            events = await github_oauth.fetch_events(access_token)
            for ev in events:
                await db["fivetran_github.events"].update_one(
                    {"user_id": current_user["sub"], "github_id": ev["id"]},
                    {"$set": {
                        "user_id": current_user["sub"],
                        "github_id": ev["id"],
                        "repo": ev.get("repo", {}).get("name"),
                        "event_type": ev.get("type"),
                        "source": "github",
                        "created_at": datetime.now(timezone.utc),
                    }},
                    upsert=True,
                )
                records_synced += 1
        except Exception:
            records_synced = 0

    else:
        records_synced = await _seed_mock_data(current_user["sub"], source)

    await connector_service.update_sync_status(connector_id, "completed")
    return {"status": "completed", "connector_id": connector_id, "records_synced": records_synced}


async def _seed_mock_data(user_id: str, source: str) -> int:
    """Seed sample data when a connector is registered without real OAuth tokens."""
    from datetime import datetime, timezone, timedelta
    import random
    db = get_db()
    count = 0
    now = datetime.now(timezone.utc)

    if source == "calendar":
        events_data = [
            {"user_id": user_id, "title": "Morning Standup", "start_time": now.replace(hour=9, minute=0), "end_time": now.replace(hour=9, minute=30), "source": "calendar"},
            {"user_id": user_id, "title": "Lunch with Team", "start_time": now.replace(hour=12, minute=0), "end_time": now.replace(hour=13, minute=0), "source": "calendar"},
            {"user_id": user_id, "title": "Gym Session", "start_time": now.replace(hour=17, minute=0), "end_time": now.replace(hour=18, minute=0), "source": "calendar"},
        ]
        for ev in events_data:
            ev["created_at"] = now
            await db["fivetran_calendar.events"].insert_one(ev)
            count += 1

    elif source == "gmail":
        emails_data = [
            {"user_id": user_id, "subject": "Project Update", "from": "alice@company.com", "received_at": now, "source": "gmail"},
            {"user_id": user_id, "subject": "Meeting Notes", "from": "bob@team.com", "received_at": now, "source": "gmail"},
        ]
        for em in emails_data:
            em["created_at"] = now
            await db["fivetran_gmail.messages"].insert_one(em)
            count += 1

    elif source == "fit":
        fit_data = [
            {"user_id": user_id, "date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
             "steps": random.randint(5000, 12000), "sleep_hours": round(random.uniform(6, 8.5), 1),
             "resting_heart_rate": random.randint(58, 72), "source": "fit"}
            for i in range(7)
        ]
        for fd in fit_data:
            fd["created_at"] = now
            await db["fivetran_fit.daily_summary"].insert_one(fd)
            count += 1

    elif source == "plaid":
        categories = ["Groceries", "Dining", "Transport", "Shopping", "Bills", "Entertainment"]
        tx_data = [
            {"user_id": user_id, "date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
             "amount": round(random.uniform(5, 200), 2), "merchant": random.choice(["Walmart", "Uber", "Netflix", "Amazon", "Starbucks"]),
             "category": random.choice(categories), "source": "plaid"}
            for i in range(15)
        ]
        for tx in tx_data:
            tx["created_at"] = now
            await db["fivetran_plaid.transactions"].insert_one(tx)
            count += 1

    elif source == "todoist":
        todo_data = [
            {"user_id": user_id, "content": "Review weekly goals", "due": (now + timedelta(days=1)).strftime("%Y-%m-%d"), "priority": 1, "source": "todoist"},
            {"user_id": user_id, "content": "Prepare presentation slides", "due": (now + timedelta(days=2)).strftime("%Y-%m-%d"), "priority": 2, "source": "todoist"},
            {"user_id": user_id, "content": "Call dentist for appointment", "due": (now + timedelta(days=3)).strftime("%Y-%m-%d"), "priority": 3, "source": "todoist"},
        ]
        for td in todo_data:
            td["created_at"] = now
            await db["fivetran_todoist.tasks"].insert_one(td)
            count += 1

    elif source == "github":
        gh_data = [
            {"user_id": user_id, "repo": "user/project", "event_type": "push", "created_at": now, "source": "github"},
            {"user_id": user_id, "repo": "user/docs", "event_type": "pull_request", "created_at": now, "source": "github"},
        ]
        for gh in gh_data:
            await db["fivetran_github.events"].insert_one(gh)
            count += 1

    elif source == "strava":
        strava_data = [
            {"user_id": user_id, "activity_type": "Run", "distance_km": random.randint(3, 15),
             "start_date": (now - timedelta(days=i)), "duration_minutes": random.randint(25, 60), "source": "strava"}
            for i in range(5)
        ]
        for sd in strava_data:
            sd["created_at"] = now
            await db["fivetran_strava.activities"].insert_one(sd)
            count += 1

    elif source == "spotify":
        spotify_data = [
            {"user_id": user_id, "track": "Blinding Lights", "artist": "The Weeknd", "played_at": now, "source": "spotify"},
            {"user_id": user_id, "track": "Flowers", "artist": "Miley Cyrus", "played_at": (now - timedelta(hours=2)), "source": "spotify"},
        ]
        for sp in spotify_data:
            sp["created_at"] = now
            await db["fivetran_spotify.history"].insert_one(sp)
            count += 1

    elif source == "uber":
        uber_data = [
            {"user_id": user_id, "trip_date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
             "pickup": random.choice(["Home", "Office", "Airport"]), "dropoff": random.choice(["Office", "Airport", "Downtown", "Mall"]),
             "fare": round(random.uniform(10, 50), 2), "source": "uber"}
            for i in range(3)
        ]
        for ud in uber_data:
            ud["created_at"] = now
            await db["fivetran_uber.trips"].insert_one(ud)
            count += 1

    elif source == "doordash":
        dd_data = [
            {"user_id": user_id, "order_date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
             "restaurant": random.choice(["Pizza Hut", "Chipotle", "Subway", "Thai Place"]),
             "total": round(random.uniform(15, 45), 2), "source": "doordash"}
            for i in range(5)
        ]
        for dd in dd_data:
            dd["created_at"] = now
            await db["fivetran_doordash.orders"].insert_one(dd)
            count += 1

    elif source == "amazon":
        amz_data = [
            {"user_id": user_id, "order_date": (now - timedelta(days=i*5)).strftime("%Y-%m-%d"),
             "item": random.choice(["USB-C Hub", "Running Shoes", "Book: Atomic Habits", "Wireless Mouse"]),
             "price": round(random.uniform(10, 80), 2), "source": "amazon"}
            for i in range(3)
        ]
        for amz in amz_data:
            amz["created_at"] = now
            await db["fivetran_amazon.orders"].insert_one(amz)
            count += 1

    elif source == "netflix":
        nf_data = [
            {"user_id": user_id, "title": "Stranger Things S5", "watched_at": (now - timedelta(days=i)), "duration_minutes": random.randint(30, 60), "source": "netflix"}
            for i in range(4)
        ]
        for nf in nf_data:
            nf["created_at"] = now
            await db["fivetran_netflix.viewing_history"].insert_one(nf)
            count += 1

    return count


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
        llm_status = "configured" if settings.gemini_api_key else "not configured"
        return {"status": "healthy", "database": "connected", "elasticsearch": es_status, "llm": llm_status}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}


@router.get("/admin/health/llm")
async def health_llm():
    from app.services.llm_service import LLMService
    if not settings.gemini_api_key:
        return {"status": "not_configured", "message": "GEMINI_API_KEY not set in .env"}
    llm = LLMService()
    try:
        response = await llm.generate("Reply with only the word: OK")
        return {"status": "ok", "response": response}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/admin/routes")
async def list_routes():
    routes = []
    for route in router.routes:
        if hasattr(route, "methods") and hasattr(route, "path"):
            for method in route.methods:
                if method != "HEAD":
                    routes.append({"method": method, "path": route.path})
    return {"routes": sorted(routes, key=lambda r: r["path"])}
