import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from backend.storage import generate_signed_upload_url, generate_signed_download_url
from backend.auth import get_current_user, CurrentUser

router = APIRouter(prefix="/api/upload", tags=["Uploads & Storage"])

class SignedUrlRequest(BaseModel):
    file_type: str  # "photo" or "document"
    content_type: str = "image/jpeg"
    file_extension: str = "jpg"

@router.post("/signed-upload-url")
def get_signed_upload_url(
    payload: SignedUrlRequest,
    user: CurrentUser = Depends(get_current_user),
):
    """Generates a secure time-limited signed URL for direct upload to private Cloud Storage."""
    unique_name = f"{payload.file_type}s/{user.uid}/{uuid.uuid4().hex[:10]}.{payload.file_extension}"
    upload_url = generate_signed_upload_url(
        blob_name=unique_name,
        content_type=payload.content_type,
        expires_minutes=15,
    )
    download_url = generate_signed_download_url(blob_name=unique_name, expires_minutes=120)
    return {
        "blob_name": unique_name,
        "upload_url": upload_url,
        "download_url": download_url,
    }

@router.get("/signed-download-url")
def get_signed_download_url_endpoint(
    blob_name: str = Query(...),
    user: CurrentUser = Depends(get_current_user),
):
    """Generates a temporary signed URL to view private photos or documents."""
    return {"url": generate_signed_download_url(blob_name=blob_name, expires_minutes=60)}
