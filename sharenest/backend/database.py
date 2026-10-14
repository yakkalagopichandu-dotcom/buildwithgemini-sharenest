from google.cloud import firestore
from backend.config import settings

_db: firestore.Client | None = None

def get_db() -> firestore.Client:
    global _db
    if _db is None:
        _db = firestore.Client(project=settings.GOOGLE_CLOUD_PROJECT)
    return _db

# Collection names
USERS_COLLECTION = "users"
CARE_HOMES_COLLECTION = "careHomes"
DONATIONS_COLLECTION = "donations"
CLAIMS_COLLECTION = "claims"
NEEDS_COLLECTION = "needs"
NOTIFICATIONS_COLLECTION = "notifications"
AUDIT_LOG_COLLECTION = "auditLog"
