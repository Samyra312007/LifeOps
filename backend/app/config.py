from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    app_name: str = "LifeOps"
    environment: str = "development"
    log_level: str = "INFO"
    secret_key: str = "change-me-in-production"

    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "lifeops"

    # Elasticsearch
    elasticsearch_host: str = "http://localhost:9200"
    elasticsearch_api_key: Optional[str] = None

    # Google Cloud
    google_cloud_project: str = "lifeops-prod"
    bigquery_dataset: str = "lifeops"

    # Gemini
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-pro"

    # Arize Phoenix
    phoenix_api_key: Optional[str] = None
    phoenix_host: str = "localhost"
    phoenix_port: int = 6006

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # Fivetran
    fivetran_api_key: Optional[str] = None
    fivetran_api_secret: Optional[str] = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
