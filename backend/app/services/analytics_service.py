import asyncio
from datetime import datetime, timezone
from typing import Optional
from app.core.bigquery import get_bq
from app.config import settings


class AnalyticsService:
    def __init__(self):
        self.client = get_bq()
        self.dataset = settings.bigquery_dataset

    async def query_raw(self, sql: str) -> list[dict]:
        if not self.client:
            return []
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_query, sql)

    def _sync_query(self, sql: str) -> list[dict]:
        job = self.client.query(sql)
        return [dict(row) for row in job.result()]

    async def get_daily_summary(self, user_id: str, date: Optional[str] = None):
        if not self.client:
            return []
        ds = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_get_daily_summary, user_id, ds)

    def _sync_get_daily_summary(self, user_id: str, date: str):
        from google.cloud import bigquery
        sql = f"""
            SELECT * FROM `{self.dataset}.daily_user_summary`
            WHERE user_id = @user_id AND date = @date
            LIMIT 1
        """
        job = self.client.query(sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("date", "STRING", date),
            ]
        ))
        return [dict(row) for row in job.result()]

    async def get_weekly_trends(self, user_id: str, days: int = 14):
        if not self.client:
            return []
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_get_weekly_trends, user_id, days)

    def _sync_get_weekly_trends(self, user_id: str, days: int):
        from google.cloud import bigquery
        sql = f"""
            SELECT * FROM `{self.dataset}.daily_user_summary`
            WHERE user_id = @user_id
            ORDER BY date DESC
            LIMIT @days
        """
        job = self.client.query(sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("days", "INT64", days),
            ]
        ))
        return [dict(row) for row in job.result()]

    async def record_event(self, event: dict):
        if not self.client:
            return None
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_record_event, event)

    def _sync_record_event(self, event: dict):
        from google.cloud import bigquery
        sql = f"""
            INSERT INTO `{self.dataset}.raw_events`
            (user_id, event_type, domain, payload, event_timestamp)
            VALUES (@user_id, @event_type, @domain, @payload, @event_timestamp)
        """
        job = self.client.query(sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", event["user_id"]),
                bigquery.ScalarQueryParameter("event_type", "STRING", event["event_type"]),
                bigquery.ScalarQueryParameter("domain", "STRING", event.get("domain", "")),
                bigquery.ScalarQueryParameter("payload", "STRING", str(event.get("payload", {}))),
                bigquery.ScalarQueryParameter("event_timestamp", "TIMESTAMP", datetime.now(timezone.utc)),
            ]
        ))
        return job.result()

    async def get_pattern_signals(self, user_id: str, days: int = 7):
        if not self.client:
            return []
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self._sync_get_pattern_signals, user_id, days)

    def _sync_get_pattern_signals(self, user_id: str, days: int):
        from google.cloud import bigquery
        sql = f"""
            SELECT * FROM `{self.dataset}.pattern_signals`
            WHERE user_id = @user_id
            ORDER BY signal_date DESC
            LIMIT @limit
        """
        job = self.client.query(sql, job_config=bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("user_id", "STRING", user_id),
                bigquery.ScalarQueryParameter("limit", "INT64", days * 5),
            ]
        ))
        return [dict(row) for row in job.result()]
