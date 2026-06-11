import httpx
from app.config import settings


TODOIST_AUTH_URL = "https://todoist.com/oauth/authorize"
TODOIST_TOKEN_URL = "https://todoist.com/oauth/access_token"
TODOIST_API_BASE = "https://api.todoist.com/rest/v2"


class TodoistService:
    def __init__(self):
        self.client_id = settings.todoist_client_id
        self.client_secret = settings.todoist_client_secret
        self.redirect_uri = settings.todoist_redirect_uri

    def get_auth_url(self, state: str) -> str:
        return (
            f"{TODOIST_AUTH_URL}?"
            f"client_id={self.client_id}&"
            f"redirect_uri={self.redirect_uri}&"
            f"scope=data:read_write&"
            f"state={state}"
        )

    async def exchange_code(self, code: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(TODOIST_TOKEN_URL, data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "redirect_uri": self.redirect_uri,
            })
            resp.raise_for_status()
            return resp.json()

    async def fetch_tasks(self, access_token: str) -> list[dict]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{TODOIST_API_BASE}/tasks",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            resp.raise_for_status()
            return resp.json()
