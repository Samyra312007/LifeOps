import httpx
from typing import Optional
from app.config import settings


class PlaidService:
    def __init__(self):
        self.client_id = settings.plaid_client_id
        self.secret = settings.plaid_secret
        self.env = settings.plaid_env
        self.base_url = f"https://{self.env}.plaid.com"

    async def create_link_token(self, user_id: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}/link/token/create", json={
                "client_id": self.client_id,
                "secret": self.secret,
                "user": {"client_user_id": user_id},
                "products": ["transactions"],
                "country_codes": ["US"],
                "language": "en",
            })
            resp.raise_for_status()
            return resp.json()

    async def exchange_public_token(self, public_token: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}/item/public_token/exchange", json={
                "client_id": self.client_id,
                "secret": self.secret,
                "public_token": public_token,
            })
            resp.raise_for_status()
            return resp.json()

    async def fetch_transactions(self, access_token: str, days: int = 30) -> list[dict]:
        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}/transactions/sync", json={
                "client_id": self.client_id,
                "secret": self.secret,
                "access_token": access_token,
            })
            resp.raise_for_status()
            data = resp.json()
            return data.get("added", [])
