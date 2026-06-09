from typing import Optional
from app.services.search_service import SearchService
from app.services.llm_service import LLMService


class BQESSyncService:
    def __init__(self):
        self.search_service = SearchService()
        self.llm_service = LLMService()

    async def sync_user_data(self, user_id: str, domain: str, records: list[dict]):
        index_name = f"{user_id}_{domain}"
        mappings = {
            "properties": {
                "user_id": {"type": "keyword"},
                "domain": {"type": "keyword"},
                "content": {"type": "text", "analyzer": "english"},
                "timestamp": {"type": "date"},
                "vector_embedding": {
                    "type": "dense_vector",
                    "dims": 768,
                    "index": True,
                    "similarity": "cosine",
                },
                "metadata": {"type": "object", "enabled": False},
                "importance": {"type": "float"},
                "tags": {"type": "keyword"},
            }
        }
        await self.search_service.create_index(index_name, mappings)
        documents = []
        for record in records:
            doc_id = record.get("id", str(hash(str(record))))
            text_content = str(record.get("content", record.get("description", record.get("title", ""))))
            embedding = await self.llm_service.embed(text_content) if text_content else []
            documents.append({
                "id": doc_id,
                "user_id": user_id,
                "domain": domain,
                "content": text_content,
                "timestamp": record.get("timestamp", record.get("date")),
                "vector_embedding": embedding,
                "metadata": record,
                "importance": record.get("importance", 0.5),
                "tags": record.get("tags", [domain]),
            })
        if documents:
            await self.search_service.bulk_index(index_name, documents)

    async def sync_cross_domain(self, user_id: str, summaries: list[dict]):
        index_name = f"{user_id}_cross_domain"
        mappings = {
            "properties": {
                "user_id": {"type": "keyword"},
                "domains": {"type": "keyword"},
                "summary": {"type": "text", "analyzer": "english"},
                "start_date": {"type": "date"},
                "end_date": {"type": "date"},
                "vector_embedding": {
                    "type": "dense_vector",
                    "dims": 768,
                    "index": True,
                    "similarity": "cosine",
                },
                "relevance_score": {"type": "float"},
            }
        }
        await self.search_service.create_index(index_name, mappings)
        documents = []
        for summary in summaries:
            text = summary.get("summary", "")
            embedding = await self.llm_service.embed(text) if text else []
            documents.append({
                "id": summary.get("id", str(hash(text))),
                "user_id": user_id,
                "domains": summary.get("domains", []),
                "summary": text,
                "start_date": summary.get("start_date"),
                "end_date": summary.get("end_date"),
                "vector_embedding": embedding,
                "relevance_score": summary.get("relevance_score", 1.0),
            })
        if documents:
            await self.search_service.bulk_index(index_name, documents)
