import pytest
from app.services.connector_service import ConnectorService


class TestConnectorService:
    @pytest.mark.asyncio
    async def test_available_sources(self):
        sources = ConnectorService.get_available_sources()
        assert len(sources) == 12
        assert "gmail" in sources
        assert "calendar" in sources
        assert "plaid" in sources

    @pytest.mark.asyncio
    async def test_register_and_get(self):
        svc = ConnectorService()
        connector_id = await svc.register_connector("test_user", "gmail")
        assert connector_id is not None

    @pytest.mark.asyncio
    async def test_update_sync_status(self):
        svc = ConnectorService()
        connector_id = await svc.register_connector("test_user_2", "calendar")
        await svc.update_sync_status(connector_id, "completed")
        connector = await svc.get_connector(connector_id)
        assert connector is not None
        assert connector.get("last_sync_status") == "completed"
