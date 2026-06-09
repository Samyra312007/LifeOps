from datetime import datetime, timezone, timedelta
from typing import Optional
from pydantic import BaseModel, Field


class AlertAction(BaseModel):
    label: str
    action_type: str
    parameters: dict = {}


class AlertUserResponse(BaseModel):
    action: str  # dismissed, action_taken, snoozed
    action_id: Optional[str] = None
    responded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AlertLogModel(BaseModel):
    user_id: str
    alert_type: str  # morning_brief, pattern_alert, critical, tip
    domain: str
    title: str
    body: str
    actions: list[AlertAction] = []
    delivery_channel: str = "in_app"  # push, in_app, email
    delivered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_at: Optional[datetime] = None
    user_response: Optional[AlertUserResponse] = None
    is_critical: bool = False
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        collection = "alert_log"


class AlertLogCreate(BaseModel):
    alert_type: str
    domain: str
    title: str
    body: str
    actions: list[AlertAction] = []
    delivery_channel: str = "in_app"
    is_critical: bool = False
