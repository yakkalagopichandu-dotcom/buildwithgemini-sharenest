from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from backend.database import get_db, CARE_HOMES_COLLECTION
from backend.auth import require_role, CurrentUser
from backend.audit import log_audit_event

router = APIRouter(prefix="/api/admin", tags=["Admin Verification"])

class ReviewActionRequest(BaseModel):
    action: str  # "VERIFIED", "NEEDS_CHANGES", "REJECTED"
    review_notes: str

@router.get("/queue")
def get_verification_queue(user: CurrentUser = Depends(require_role(["ADMIN", "DONOR", "CARE_HOME"]))):
    """Returns only authorized/verified care homes as requested."""
    db = get_db()
    docs = db.collection(CARE_HOMES_COLLECTION).where("status", "==", "VERIFIED").stream()
    queue = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        queue.append(item)
    return queue

@router.post("/review/{home_id}")
def review_care_home(
    home_id: str,
    payload: ReviewActionRequest,
    user: CurrentUser = Depends(require_role(["ADMIN", "DONOR", "CARE_HOME"])),
):
    valid_actions = ["VERIFIED", "NEEDS_CHANGES", "REJECTED"]
    if payload.action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Choose from {valid_actions}")

    db = get_db()
    doc_ref = db.collection(CARE_HOMES_COLLECTION).document(home_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Care home not found")

    doc_ref.update({
        "status": payload.action,
        "admin_notes": payload.review_notes,
        "reviewed_by": user.uid,
    })

    log_audit_event(
        action=f"ADMIN_REVIEW_{payload.action}",
        actor_id=user.uid,
        actor_role="ADMIN",
        is_ai_action=False,
        details={"care_home_id": home_id, "action": payload.action, "notes": payload.review_notes},
    )

    return {"success": True, "status": payload.action}
