import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_register_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        register_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "email": "test-auth@test.com",
                "password": "testpass123",
                "display_name": "Test Auth",
                "timezone": "UTC",
            },
        )
        assert register_resp.status_code == 200
        data = register_resp.json()
        assert "access_token" in data
        assert "user_id" in data
