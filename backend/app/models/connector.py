from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class ConnectorModel(BaseModel):
    user_id: str
    source: str  # gmail, calendar, plaid, fit, amazon, doordash, spotify, todoist, github, strava, uber, netflix
    status: str = "active"  # active, error, disconnected, pending
    oauth_tokens: dict = {}
    connected_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_sync_at: Optional[datetime] = None
    last_sync_status: Optional[str] = None
    error_message: Optional[str] = None
    sync_frequency_minutes: int = 15
    settings: dict = {}

    class Config:
        from_attributes = True
        collection = "user_connectors"


class OAuthStateModel(BaseModel):
    user_id: str
    source: str
    state_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        collection = "oauth_states"
