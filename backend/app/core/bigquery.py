from google.cloud import bigquery
from app.config import settings

bq_client: bigquery.Client = None


def connect_bigquery():
    global bq_client
    bq_client = bigquery.Client(project=settings.google_cloud_project)
    return bq_client


def get_bq():
    return bq_client
