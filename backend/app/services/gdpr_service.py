from datetime import datetime, timezone
from app.core.database import get_db, close_db


class GDPRService:
    async def export_user_data(self, user_id: str) -> dict:
        db = get_db()
        collections = ["users", "user_memories", "user_patterns", "user_relationships",
                       "user_decisions", "alert_log", "user_connectors", "push_queue",
                       "action_audit_log", "schedules"]
        export = {}
        for coll_name in collections:
            try:
                cursor = db[coll_name].find({"user_id": user_id})
                docs = await cursor.to_list(length=5000)
                for doc in docs:
                    doc.pop("_id", None)
                    doc.pop("hashed_password", None)
                    doc.pop("oauth_tokens", None)
                export[coll_name] = docs
            except Exception:
                export[coll_name] = []
        export["exported_at"] = datetime.now(timezone.utc).isoformat()
        export["user_id"] = user_id
        return export

    async def delete_user_data(self, user_id: str) -> dict:
        db = get_db()
        collections = [
            ("user_memories", "user_id"),
            ("user_patterns", "user_id"),
            ("user_relationships", "user_id"),
            ("user_decisions", "user_id"),
            ("alert_log", "user_id"),
            ("user_connectors", "user_id"),
            ("push_queue", "user_id"),
            ("action_audit_log", "user_id"),
            ("schedules", "user_id"),
            ("tasks", "user_id"),
            ("fivetran_events", "connector_id"),
        ]
        deleted_counts = {}
        for coll_name, id_field in collections:
            try:
                if id_field == "connector_id":
                    connectors = await db["user_connectors"].find({"user_id": user_id}).to_list(length=100)
                    connector_ids = [str(c["_id"]) for c in connectors]
                    if connector_ids:
                        result = await db[coll_name].delete_many({id_field: {"$in": connector_ids}})
                        deleted_counts[coll_name] = result.deleted_count
                else:
                    result = await db[coll_name].delete_many({id_field: user_id})
                    deleted_counts[coll_name] = result.deleted_count
            except Exception as e:
                deleted_counts[coll_name] = str(e)
        # Delete the user itself last
        from bson import ObjectId
        user_result = await db["users"].delete_one({"_id": ObjectId(user_id)})
        deleted_counts["users"] = user_result.deleted_count
        deleted_counts["total"] = sum(v for v in deleted_counts.values() if isinstance(v, int))
        return deleted_counts
