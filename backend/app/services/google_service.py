import httpx
from datetime import datetime, timezone
from app.config import settings

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
SCOPES = (
    "https://www.googleapis.com/auth/calendar.readonly "
    "https://www.googleapis.com/auth/gmail.readonly "
    "openid email profile"
)

class GoogleOAuthService:
    def __init__(self):
        self.client_id = settings.google_client_id
        self.client_secret = settings.google_client_secret
        self.redirect_uri = settings.google_redirect_uri

    def get_auth_url(self, state: str) -> str:
        return (
            f"{GOOGLE_AUTH_URL}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={SCOPES.replace(' ', '%20')}&"
            f"access_type=offline&"
            f"prompt=consent&"
            f"state={state}"
        )

    async def exchange_code(self, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(GOOGLE_TOKEN_URL, data={
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
            resp = await client.get(GOOGLE_USERINFO_URL, headers={
                "Authorization": f"Bearer {access_token}"
            })
            resp.raise_for_status()
            return resp.json().get("email", "")

    async def refresh_access_token(self, refresh_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(GOOGLE_TOKEN_URL, data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            })
            resp.raise_for_status()
            return resp.json()

    async def fetch_calendar_events(self, access_token: str, max_results: int = 50) -> list[dict]:
        async with httpx.AsyncClient() as client:
            now = datetime.now(timezone.utc).isoformat()
            resp = await client.get(
                "https://www.googleapis.com/calendar/v3/calendars/primary/events",
                headers={"Authorization": f"Bearer {access_token}"},
                params={
                    "timeMin": now,
                    "maxResults": max_results,
                    "singleEvents": "true",
                    "orderBy": "startTime",
                },
            )
            resp.raise_for_status()
            return resp.json().get("items", [])

    async def fetch_gmail_messages(self, access_token: str, max_results: int = 20) -> list[dict]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://gmail.googleapis.com/gmail/v1/users/me/messages",
                headers={"Authorization": f"Bearer {access_token}"},
                params={"maxResults": max_results},
            )
            resp.raise_for_status()
            data = resp.json()
        messages = data.get("messages", [])
        emails = []
        async with httpx.AsyncClient() as client:
            for msg in messages[:max_results]:
                try:
                    resp = await client.get(
                        f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{msg['id']}",
                        headers={"Authorization": f"Bearer {access_token}"},
                        params={"format": "metadata", "metadataHeaders": "From,Subject,Date"},
                    )
                    resp.raise_for_status()
                    emails.append(resp.json())
                except Exception:
                    continue
        return emails

    async def ensure_valid_token(self, oauth_tokens: dict) -> str:
        access_token = oauth_tokens.get("access_token", "")
        expires_at = oauth_tokens.get("expires_at", 0)
        refresh_token = oauth_tokens.get("refresh_token", "")
        if refresh_token and expires_at and datetime.now(timezone.utc).timestamp() >= expires_at:
            new_tokens = await self.refresh_access_token(refresh_token)
            access_token = new_tokens.get("access_token", access_token)
        return access_token
