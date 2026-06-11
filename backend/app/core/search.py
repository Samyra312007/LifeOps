import asyncio
from elasticsearch import AsyncElasticsearch
from typing import Optional
from app.config import settings

es_client: Optional[AsyncElasticsearch] = None


async def connect_elasticsearch():
    global es_client
    try:
        test_client = AsyncElasticsearch(
            hosts=[settings.elasticsearch_host],
            api_key=settings.elasticsearch_api_key,
            request_timeout=3,
        )
        await asyncio.wait_for(test_client.info(), timeout=3)
        es_client = test_client
    except Exception:
        es_client = None
    return es_client


async def close_elasticsearch():
    global es_client
    if es_client:
        await es_client.close()


def get_es():
    return es_client
