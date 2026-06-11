import httpx
from datetime import datetime, timezone, timedelta
from app.config import settings


FITBIT_AUTH_URL = "https://www.fitbit.com/oauth2/authorize"
FITBIT_TOKEN_URL = "https://api.fitbit.com/oauth2/token"
FITBIT_SCOPES = "activity heartrate location nutrition profile settings sleep social weight"


class FitbitService:
    def __init__(self):
        self.client_id = settings.fitbit_client_id
        self.client_secret = settings.fitbit_client_secret
        self.redirect_uri = settings.fitbit_redirect_uri

    def get_auth_url(self, state: str) -> str:
        return (
            f"{FITBIT_AUTH_URL}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"response_type=code&"
            f"scope={FITBIT_SCOPES.replace(' ', '%20')}&"
            f"state={state}"
        )

    async def exchange_code(self, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                FITBIT_TOKEN_URL,
                data={
                    "code": code,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": self.redirect_uri,
                    "grant_type": "authorization_code",
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            resp.raise_for_status()
            return resp.json()

    async def fetch_activity(self, access_token: str, days: int = 7) -> list[dict]:
        results = []
        async with httpx.AsyncClient() as client:
            for i in range(days):
                date = (datetime.now(timezone.utc) - timedelta(days=i)).strftime("%Y-%m-%d")
                resp = await client.get(
                    f"https://api.fitbit.com/1/user/-/activities/date/{date}.json",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
                if resp.status_code != 200:
                    continue
                results.append(resp.json())
        return results
