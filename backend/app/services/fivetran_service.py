from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.services.connector_service import ConnectorService


class FivetranService:
    def __init__(self):
        self.connector_service = ConnectorService()

    async def handle_sync_complete(self, payload: dict) -> dict:
        connector_id = payload.get("connector_id", "")
        schema = payload.get("schema_name", "")
        status = payload.get("sync_status", "completed")
        records_count = payload.get("records_synced", 0)
        error = payload.get("error_message")

        # Find which user owns this connector
        db = get_db()
        connector = await db["user_connectors"].find_one({"source": schema.split("_")[1] if "_" in schema else schema})
        if connector:
            await self.connector_service.update_sync_status(
                str(connector["_id"]),
                "completed" if status == "completed" else "error",
                error,
            )
        await self._log_event(connector_id, schema, status, records_count, error)
        return {"received": True, "connector_id": connector_id}

    async def handle_sync_error(self, connector_id: str, schema: str, error: str):
        db = get_db()
        await db["fivetran_errors"].insert_one({
            "connector_id": connector_id,
            "schema": schema,
            "error": error,
            "occurred_at": datetime.now(timezone.utc),
        })

    async def _log_event(self, connector_id: str, schema: str, status: str, records: int, error: Optional[str]):
        db = get_db()
        await db["fivetran_events"].insert_one({
            "connector_id": connector_id,
            "schema": schema,
            "status": status,
            "records_synced": records,
            "error_message": error,
            "created_at": datetime.now(timezone.utc),
        })

    async def get_sync_history(self, user_id: str, limit: int = 20) -> list[dict]:
        db = get_db()
        connectors = await db["user_connectors"].find({"user_id": user_id}).to_list(length=50)
        connector_ids = [str(c["_id"]) for c in connectors]
        cursor = db["fivetran_events"].find(
            {"connector_id": {"$in": connector_ids}}
        ).sort("created_at", -1).limit(limit)
        return await cursor.to_list(length=limit)
