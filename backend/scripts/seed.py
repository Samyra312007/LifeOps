import asyncio
import os
import sys
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import connect_db, close_db, get_db
from app.core.auth import hash_password
from app.config import settings


async def seed():
    await connect_db()
    db = get_db()

    # Clear existing data
    for coll in ["users", "user_memories", "user_patterns", "user_relationships", "user_decisions"]:
        await db[coll].delete_many({})
        print(f"Cleared {coll}")

    # Seed users
    users = [
        {
            "email": "test@lifeops.ai",
            "display_name": "Test User",
            "hashed_password": hash_password("password123"),
            "timezone": "America/New_York",
            "wake_time": "07:00",
            "bed_time": "23:00",
            "onboarding_completed": True,
            "goals": [
                {"id": "g1", "title": "Exercise 3x/week", "domain": "health", "target": "2026-12-31"},
                {"id": "g2", "title": "Save $500/month", "domain": "finance", "target": "2026-12-31"},
            ],
            "preferences": {"brief_time_morning": "07:30", "brief_time_evening": "21:00"},
            "data_connectors": [],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
    ]
    user_results = await db["users"].insert_many(users)
    user_id = str(user_results.inserted_ids[0])
    print(f"Seeded user: {user_id}")

    # Seed patterns
    patterns = [
        {
            "user_id": user_id,
            "domain": "health",
            "pattern_type": "sleep_debt",
            "pattern_signature": {"avg_sleep": 5.5, "bedtime_variance": 120},
            "confidence": 0.75,
            "occurrences": [],
            "last_occurrence": datetime.now(timezone.utc) - timedelta(days=1),
            "recurrence_count": 12,
            "active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        },
        {
            "user_id": user_id,
            "domain": "finance",
            "pattern_type": "budget_bleed",
            "pattern_signature": {"avg_monthly_overage": 200, "categories": ["food", "entertainment"]},
            "confidence": 0.6,
            "occurrences": [],
            "last_occurrence": datetime.now(timezone.utc) - timedelta(days=5),
            "recurrence_count": 3,
            "active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        },
    ]
    await db["user_patterns"].insert_many(patterns)
    print("Seeded patterns")

    # Seed memories
    memories = [
        {
            "user_id": user_id,
            "memory_type": "preference",
            "domain": "health",
            "content": {"text": "User prefers morning workouts before work"},
            "importance_score": 0.8,
            "access_count": 5,
            "tags": ["health", "exercise", "routine"],
            "source_trace_ids": [],
            "created_at": datetime.now(timezone.utc),
            "last_accessed_at": datetime.now(timezone.utc),
            "expires_at": None,
        },
        {
            "user_id": user_id,
            "memory_type": "fact",
            "domain": "social",
            "content": {"text": "User's best friend birthday is March 15"},
            "importance_score": 0.9,
            "access_count": 3,
            "tags": ["social", "birthday", "important"],
            "source_trace_ids": [],
            "created_at": datetime.now(timezone.utc),
            "last_accessed_at": datetime.now(timezone.utc),
            "expires_at": None,
        },
    ]
    await db["user_memories"].insert_many(memories)
    print("Seeded memories")

    # Seed relationships
    relationships = [
        {
            "user_id": user_id,
            "contact_email": "alice@example.com",
            "contact_name": "Alice Johnson",
            "relationship_type": "friend",
            "important_dates": [{"type": "birthday", "date": "2026-03-15", "label": "Alice's Birthday"}],
            "preferences": {"gift_ideas": ["books", "plants"]},
            "interaction_history": [],
            "last_contact": datetime.now(timezone.utc) - timedelta(days=7),
            "contact_frequency_days": 14.0,
            "importance_score": 0.9,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        },
        {
            "user_id": user_id,
            "contact_email": "bob@work.com",
            "contact_name": "Bob Smith",
            "relationship_type": "colleague",
            "important_dates": [],
            "preferences": {},
            "interaction_history": [],
            "last_contact": datetime.now(timezone.utc) - timedelta(days=2),
            "contact_frequency_days": 5.0,
            "importance_score": 0.6,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        },
    ]
    await db["user_relationships"].insert_many(relationships)
    print("Seeded relationships")

    await close_db()
    print("\nSeed complete! Login with: test@lifeops.ai / password123")


if __name__ == "__main__":
    asyncio.run(seed())
