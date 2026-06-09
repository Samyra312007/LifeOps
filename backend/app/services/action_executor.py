from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.services.connector_service import ConnectorService


class ActionExecutor:
    def __init__(self):
        self.connector_service = ConnectorService()

    async def execute_action(self, user_id: str, trace_id: str, action_type: str, parameters: dict) -> dict:
        action_map = {
            "create_calendar_event": self._create_calendar_event,
            "send_email": self._send_email,
            "cancel_subscription": self._cancel_subscription,
            "block_time": self._block_calendar_time,
            "create_task": self._create_task,
            "_default": self._default_executor,
        }
        handler = action_map.get(action_type, action_map["_default"])
        result = await handler(user_id, parameters)
        await self._audit_log(user_id, trace_id, action_type, parameters, result)
        return result

    async def _create_calendar_event(self, user_id: str, params: dict) -> dict:
        tokens = await self._get_connector_tokens(user_id, "calendar")
        if not tokens:
            return {"status": "error", "message": "Calendar not connected", "needs_reauth": True}
        try:
            # Google Calendar API call stub
            event = {
                "summary": params.get("title", "LifeOps Event"),
                "description": params.get("description", ""),
                "start": {"dateTime": params.get("start_time"), "timeZone": params.get("timezone", "UTC")},
                "end": {"dateTime": params.get("end_time"), "timeZone": params.get("timezone", "UTC")},
            }
            # In production: from google.oauth2.credentials import Credentials
            # from googleapiclient.discovery import build
            # service = build("calendar", "v3", credentials=creds)
            # created = service.events().insert(calendarId="primary", body=event).execute()
            return {
                "status": "success",
                "message": f"Event '{event['summary']}' created",
                "event_id": f"stub-{datetime.now(timezone.utc).timestamp()}",
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _send_email(self, user_id: str, params: dict) -> dict:
        tokens = await self._get_connector_tokens(user_id, "gmail")
        if not tokens:
            return {"status": "error", "message": "Gmail not connected", "needs_reauth": True}
        try:
            # Gmail API call stub
            to = params.get("to", "")
            subject = params.get("subject", "LifeOps Notification")
            body = params.get("body", "")
            # In production: from googleapiclient.discovery import build
            # import base64
            # from email.message import EmailMessage
            # message = EmailMessage()
            # message.set_content(body)
            # message["To"] = to
            # message["Subject"] = subject
            # encoded = base64.urlsafe_b64encode(message.as_bytes()).decode()
            # service.users().messages().send(userId="me", body={"raw": encoded}).execute()
            return {
                "status": "success",
                "message": f"Email sent to {to}",
                "email_id": f"stub-{datetime.now(timezone.utc).timestamp()}",
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _cancel_subscription(self, user_id: str, params: dict) -> dict:
        service_name = params.get("service_name", "")
        try:
            # Plaid API + email-based cancellation stub
            return {
                "status": "success",
                "message": f"Cancellation initiated for {service_name}",
                "requires_confirmation": True,
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _block_calendar_time(self, user_id: str, params: dict) -> dict:
        return await self._create_calendar_event(user_id, {
            "title": params.get("title", "Focus Block"),
            "description": params.get("description", "Focus time"),
            "start_time": params.get("start_time"),
            "end_time": params.get("end_time"),
            "timezone": params.get("timezone", "UTC"),
        })

    async def _create_task(self, user_id: str, params: dict) -> dict:
        try:
            db = get_db()
            task = {
                "user_id": user_id,
                "content": params.get("content", ""),
                "description": params.get("description", ""),
                "due_date": params.get("due_date"),
                "priority": params.get("priority", 1),
                "is_completed": False,
                "source": "lifeops_action",
                "created_at": datetime.now(timezone.utc),
            }
            result = await db["tasks"].insert_one(task)
            return {
                "status": "success",
                "message": f"Task created: {task['content']}",
                "task_id": str(result.inserted_id),
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    async def _default_executor(self, user_id: str, params: dict) -> dict:
        return {"status": "logged", "message": "Action type not supported for direct execution"}

    async def _get_connector_tokens(self, user_id: str, source: str) -> Optional[dict]:
        db = get_db()
        connector = await db["user_connectors"].find_one(
            {"user_id": user_id, "source": source, "status": "active"}
        )
        if connector:
            return connector.get("oauth_tokens")
        return None

    async def _audit_log(self, user_id: str, trace_id: str, action_type: str, params: dict, result: dict):
        db = get_db()
        await db["action_audit_log"].insert_one({
            "user_id": user_id,
            "trace_id": trace_id,
            "action_type": action_type,
            "parameters": params,
            "result": result,
            "created_at": datetime.now(timezone.utc),
        })
