from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field


class PatternOccurrence(BaseModel):
    start_date: datetime
    end_date: Optional[datetime] = None
    severity: str = "medium"
    outcome: Optional[str] = None
    interventions_attempted: list[str] = []
    intervention_success: Optional[bool] = None


class PatternModel(BaseModel):
    user_id: str
    domain: str
    pattern_type: str  # stress_spiral, budget_bleed, sleep_debt, exercise_gap, social_isolation, work_burnout
    pattern_signature: dict = {}
    confidence: float = 0.0
    occurrences: list[PatternOccurrence] = []
    last_occurrence: Optional[datetime] = None
    recurrence_count: int = 0
    active: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        from_attributes = True
        collection = "user_patterns"


class PatternSignal(BaseModel):
    user_id: str
    pattern_type: str
    confidence: float
    signal_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    contributing_factors: list[dict] = []
    recommended_interventions: list[str] = []
    severity: str = "medium"
