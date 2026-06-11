import httpx
from datetime import datetime, timezone, timedelta
from app.config import settings

FITNESS_BASE = "https://www.googleapis.com/fitness/v1/users/me"
FITNESS_SCOPES = (
    "https://www.googleapis.com/auth/fitness.activity.read "
    "https://www.googleapis.com/auth/fitness.body.read "
    "https://www.googleapis.com/auth/fitness.sleep.read "
    "https://www.googleapis.com/auth/fitness.heart_rate.read"
)


class GoogleFitService:
    def __init__(self):
        self.client_id = settings.google_client_id
        self.client_secret = settings.google_client_secret
        self.redirect_uri = settings.google_fit_redirect_uri

    def get_auth_url(self, state: str) -> str:
        return (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={FITNESS_SCOPES.replace(' ', '%20')}&"
            f"access_type=offline&"
            f"prompt=consent&"
            f"state={state}"
        )

    async def exchange_code(self, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://oauth2.googleapis.com/token", data={
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": self.redirect_uri,
                "grant_type": "authorization_code",
            })
            resp.raise_for_status()
            return resp.json()

    async def get_user_email(self, access_token: str) -> str:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            resp.raise_for_status()
            return resp.json().get("email", "")

    async def refresh_access_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post("https://oauth2.googleapis.com/token", data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            })
            resp.raise_for_status()
            return resp.json()

    async def fetch_activity_sessions(self, access_token: str, days: int = 7) -> list[dict]:
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=days)
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{FITNESS_BASE}/sessions:search",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "startTime": start_time.isoformat(),
                    "endTime": end_time.isoformat(),
                },
            )
            resp.raise_for_status()
            return resp.json().get("session", [])

    async def fetch_daily_steps(self, access_token: str, days: int = 7) -> list[dict]:
        end_ns = int(datetime.now(timezone.utc).timestamp() * 1e9)
        start_ns = int((datetime.now(timezone.utc) - timedelta(days=days)).timestamp() * 1e9)
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{FITNESS_BASE}/dataset:aggregate",
                headers={"Authorization": f"Bearer {access_token}"},
                json={
                    "aggregateBy": [{
                        "dataTypeName": "com.google.step_count.delta",
                        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
                    }],
                    "bucketByTime": {"durationMillis": 86400000},
                    "startTimeMillis": start_ns // 1_000_000,
                    "endTimeMillis": end_ns // 1_000_000,
                },
            )
            resp.raise_for_status()
            return resp.json().get("bucket", [])

    async def ensure_valid_token(self, oauth_tokens: dict) -> str:
        access_token = oauth_tokens.get("access_token", "")
        expires_at = oauth_tokens.get("expires_at", 0)
        refresh_token = oauth_tokens.get("refresh_token", "")
        if refresh_token and expires_at and datetime.now(timezone.utc).timestamp() >= expires_at:
            new_tokens = await self.refresh_access_token(refresh_token)
            access_token = new_tokens.get("access_token", access_token)
        return access_token
