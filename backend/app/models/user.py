from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class UserModel(BaseModel):
    email: str
    display_name: str
    hashed_password: str
    timezone: str = "UTC"
    wake_time: str = "07:00"
    bed_time: str = "23:00"
    onboarding_completed: bool = False
    goals: list[dict] = []
    preferences: dict = {}
    data_connectors: list[dict] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        collection = "users"


class UserCreate(BaseModel):
    email: str
    password: str
    display_name: str
    timezone: str = "UTC"


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str
    timezone: str
    onboarding_completed: bool
    goals: list[dict]
    preferences: dict
    data_connectors: list[dict]
    created_at: datetime
