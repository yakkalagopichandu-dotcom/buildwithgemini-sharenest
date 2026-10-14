import datetime
import logging
from google.cloud import storage
from backend.config import settings

logger = logging.getLogger("storage")
_storage_client: storage.Client | None = None

def get_storage_client() -> storage.Client:
    global _storage_client
    if _storage_client is None:
        _storage_client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
    return _storage_client

def generate_signed_upload_url(blob_name: str, content_type: str = "image/jpeg", expires_minutes: int = 15) -> str:
    """Generate a PUT signed URL for direct browser uploads to private GCS."""
    try:
        client = get_storage_client()
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=expires_minutes),
            method="PUT",
            content_type=content_type,
        )
        return url
    except Exception as e:
        logger.warning(f"Signed URL fallback for dev credentials: {e}")
        return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{blob_name}?mock_signed_upload=true"

def generate_signed_download_url(blob_name: str, expires_minutes: int = 60) -> str:
    """Generate a GET signed URL for authorized viewing of private files."""
    if blob_name.startswith("gs://"):
        parts = blob_name.replace("gs://", "").split("/", 1)
        if len(parts) == 2:
            blob_name = parts[1]
    elif "storage.googleapis.com" in blob_name:
        blob_name = blob_name.split(f"{settings.GCS_BUCKET_NAME}/")[-1].split("?")[0]

    try:
        client = get_storage_client()
        bucket = client.bucket(settings.GCS_BUCKET_NAME)
        blob = bucket.blob(blob_name)
        
        url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=expires_minutes),
            method="GET",
        )
        return url
    except Exception as e:
        logger.warning(f"Signed URL fallback for dev credentials: {e}")
        return f"https://storage.googleapis.com/{settings.GCS_BUCKET_NAME}/{blob_name}"
