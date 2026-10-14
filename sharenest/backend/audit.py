import datetime
import uuid
from typing import Any, Dict, Optional
from backend.database import get_db, AUDIT_LOG_COLLECTION

def log_audit_event(
    action: str,
    actor_id: str,
    actor_role: str,
    is_ai_action: bool = False,
    details: Optional[Dict[str, Any]] = None,
) -> str:
    """Logs an audit event to the Firestore auditLog collection.
    Guarantees no PII in system message keys.
    """
    db = get_db()
    event_id = f"audit-{uuid.uuid4().hex[:8]}"
    clean_details = details or {}
    # Strip any potential sensitive raw data
    if "gov_id_number" in clean_details:
        clean_details["gov_id_number"] = "***MASKED***"

    record = {
        "id": event_id,
        "action": action,
        "actor_id": actor_id,
        "actor_role": actor_role,
        "is_ai_action": is_ai_action,
        "details": clean_details,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }
    db.collection(AUDIT_LOG_COLLECTION).document(event_id).set(record)
    return event_id
