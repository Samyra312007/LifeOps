from typing import Optional
from app.core.search import get_es
from app.config import settings


class SearchService:
    def __init__(self):
        self.client = None

    async def _get_client(self):
        if self.client is None:
            self.client = get_es()
        if self.client is None:
            return None
        return self.client

    async def index_document(self, index: str, doc_id: str, body: dict):
        es = await self._get_client()
        if es is None:
            return

    async def hybrid_search(
        self,
        index: str,
        query_text: str,
        query_vector: Optional[list[float]] = None,
        filters: Optional[dict] = None,
        top_k: int = 10,
    ) -> list[dict]:
        es = await self._get_client()
        if es is None:
            return []
        must_clauses = [{"match": {"_all": query_text}}]
        if filters:
            must_clauses.append({"term": filters})

        body = {
            "query": {"bool": {"must": must_clauses}},
            "size": top_k,
        }

        if query_vector:
            body["knn"] = {
                "field": "vector_embedding",
                "query_vector": query_vector,
                "k": top_k,
                "num_candidates": 100,
            }

        response = await es.search(index=index, body=body)
        return [{"id": hit["_id"], "score": hit["_score"], **hit["_source"]} for hit in response["hits"]["hits"]]

    async def search_cross_domain(
        self,
        user_id: str,
        query_text: str,
        domains: Optional[list[str]] = None,
        top_k: int = 20,
    ) -> list[dict]:
        es = await self._get_client()
        if es is None:
            return []
        must_clauses = [{"term": {"user_id": user_id}}, {"match": {"_all": query_text}}]
        if domains:
            must_clauses.append({"terms": {"domain": domains}})

        body = {"query": {"bool": {"must": must_clauses}}, "size": top_k}
        response = await es.search(index=f"{user_id}_cross_domain", body=body)
        return [{"id": hit["_id"], "score": hit["_score"], **hit["_source"]} for hit in response["hits"]["hits"]]

    async def create_index(self, index: str, mappings: dict):
        es = await self._get_client()
        if es is None:
            return
        exists = await es.indices.exists(index=index)
        if not exists:
            await es.indices.create(index=index, body={"mappings": mappings})

    async def delete_index(self, index: str):
        es = await self._get_client()
        if es is None:
            return
        await es.indices.delete(index=index, ignore_unavailable=True)

    async def bulk_index(self, index: str, documents: list[dict]):
        es = await self._get_client()
        if es is None:
            return
        operations = []
        for doc in documents:
            operations.append({"index": {"_index": index, "_id": doc.get("id")}})
            operations.append(doc)
        if operations:
            await es.bulk(operations=operations)
