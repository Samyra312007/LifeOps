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
    gemini_embedding_model: str = "models/text-embedding-004"

    # Arize Phoenix
    phoenix_api_key: Optional[str] = None
    phoenix_host: str = "localhost"
    phoenix_port: int = 6006

    # JWT
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8080/api/v1/auth/oauth/google/callback"

    # Plaid
    plaid_client_id: str = ""
    plaid_secret: str = ""
    plaid_env: str = "sandbox"

    # Google Fit
    google_fit_redirect_uri: str = "http://localhost:8080/api/v1/auth/oauth/googlefit/callback"

    # Fitbit
    fitbit_client_id: str = ""
    fitbit_client_secret: str = ""
    fitbit_redirect_uri: str = "http://localhost:8080/api/v1/auth/oauth/fitbit/callback"

    # Todoist
    todoist_client_id: str = ""
    todoist_client_secret: str = ""
    todoist_redirect_uri: str = "http://localhost:8080/api/v1/auth/oauth/todoist/callback"

    # GitHub
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8080/api/v1/auth/oauth/github/callback"

    # Fivetran
    fivetran_api_key: Optional[str] = None
    fivetran_api_secret: Optional[str] = None

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
