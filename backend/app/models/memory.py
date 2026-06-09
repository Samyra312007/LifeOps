from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class MemoryModel(BaseModel):
    user_id: str
    memory_type: str  # pattern, preference, fact, decision, relationship_event
    domain: str
    content: dict
    importance_score: float = 0.5
    access_count: int = 0
    tags: list[str] = []
    source_trace_ids: list[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_accessed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        collection = "user_memories"


class MemoryCreate(BaseModel):
    memory_type: str
    domain: str
    content: dict
    importance_score: float = 0.5
    tags: list[str] = []
