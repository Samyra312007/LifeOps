from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.core.database import connect_db, close_db
from app.core.search import connect_elasticsearch, close_elasticsearch
from app.core.bigquery import connect_bigquery
from app.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    try:
        await connect_elasticsearch()
    except Exception:
        pass
    try:
        connect_bigquery()
    except Exception:
        pass
    yield
    await close_db()
    await close_elasticsearch()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")
