from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class DecisionOption(BaseModel):
    id: str
    label: str
    action_type: str
    parameters: dict = {}


class UserAction(BaseModel):
    selected_option_id: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    was_followed_through: Optional[bool] = None


class Outcome(BaseModel):
    quality_score: Optional[float] = None
    notes: Optional[str] = None


class DecisionModel(BaseModel):
    user_id: str
    trace_id: str
    query: str
    synthesized_context: str = ""
    recommendation: dict = {}
    user_action: Optional[UserAction] = None
    outcome: Optional[Outcome] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        collection = "user_decisions"
