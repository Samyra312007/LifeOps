from elasticsearch import AsyncElasticsearch
from typing import Optional
from app.config import settings

es_client: Optional[AsyncElasticsearch] = None


async def connect_elasticsearch():
    global es_client
    es_client = AsyncElasticsearch(
        hosts=[settings.elasticsearch_host],
        api_key=settings.elasticsearch_api_key,
    )
    await es_client.info()
    return es_client


async def close_elasticsearch():
    global es_client
    if es_client:
        await es_client.close()


def get_es():
    return es_client
