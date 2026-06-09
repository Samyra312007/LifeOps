from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class InteractionHistory(BaseModel):
    date: datetime
    type: str  # meeting, email, social, gift
    source: str
    notes: Optional[str] = None


class RelationshipModel(BaseModel):
    user_id: str
    contact_email: str
    contact_name: str
    relationship_type: str = "friend"  # family, friend, colleague, partner
    important_dates: list[dict] = []
    preferences: dict = {}
    interaction_history: list[InteractionHistory] = []
    last_contact: Optional[datetime] = None
    contact_frequency_days: Optional[float] = None
    importance_score: float = 0.5
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        collection = "user_relationships"
