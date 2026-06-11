import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=3000,
    )
    db = client[settings.mongodb_db_name]
    await asyncio.wait_for(db.command("ping"), timeout=3)
    return db


async def close_db():
    global client
    if client:
        await client.close()


def get_db():
    return db
