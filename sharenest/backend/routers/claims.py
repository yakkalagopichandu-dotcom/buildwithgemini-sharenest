import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from backend.database import get_db, DONATIONS_COLLECTION, CLAIMS_COLLECTION
from backend.auth import get_current_user, CurrentUser
from backend.audit import log_audit_event

router = APIRouter(prefix="/api/claims", tags=["Claims & Inspection"])

class ClaimRequest(BaseModel):
    donation_id: str
    notes: Optional[str] = ""

class InspectionRequest(BaseModel):
    donation_id: str
    inspection_photos: List[str]
    notes: str
    action: str  # "ACCEPT" or "REJECT"
    rejection_reason: Optional[str] = None

@router.post("")
def claim_donation_endpoint(
    payload: ClaimRequest,
    user: CurrentUser = Depends(get_current_user),
):
    db = get_db()
    don_ref = db.collection(DONATIONS_COLLECTION).document(payload.donation_id)
    doc = don_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Donation not found")
    data = doc.to_dict()
    if data.get("status") != "available":
        raise HTTPException(status_code=400, detail="Donation is not available for claim")

    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    claim_id = f"claim-{uuid.uuid4().hex[:6]}"

    timeline = data.get("timeline", [])
    timeline.append({
        "status": "MATCHED",
        "actor": user.name or "Care Home",
        "timestamp": now_str,
        "note": f"Claimed by {user.name}. Moving to In Transit / Pickup.",
    })

    don_ref.update({
        "status": "claimed",
        "claimed_by": user.name or "Care Home",
        "claimed_by_id": user.uid,
        "timeline": timeline,
    })

    claim_doc = {
        "id": claim_id,
        "donation_id": payload.donation_id,
        "care_home_id": user.uid,
        "care_home_name": user.name or "Care Home",
        "claimed_at": now_str,
        "status": "IN_TRANSIT",
    }
    db.collection(CLAIMS_COLLECTION).document(claim_id).set(claim_doc)

    log_audit_event(
        action="CLAIM_DONATION",
        actor_id=user.uid,
        actor_role=user.role,
        is_ai_action=False,
        details={"donation_id": payload.donation_id, "claim_id": claim_id},
    )

    return {"success": True, "claim": claim_doc}

@router.post("/inspect")
def inspect_and_decide(
    payload: InspectionRequest,
    user: CurrentUser = Depends(get_current_user),
):
    if payload.action == "ACCEPT" and not payload.inspection_photos:
        raise HTTPException(
            status_code=400,
            detail="Inspection photo is mandatory for accepting a donation.",
        )

    db = get_db()
    don_ref = db.collection(DONATIONS_COLLECTION).document(payload.donation_id)
    doc = don_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Donation not found")
    data = doc.to_dict()

    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
    timeline = data.get("timeline", [])

    timeline.append({
        "status": "INSPECTED",
        "actor": user.name or "Inspector",
        "timestamp": now_str,
        "note": f"Physical inspection completed. Notes: {payload.notes}",
    })

    if payload.action == "ACCEPT":
        new_status = "completed"
        timeline.append({
            "status": "ACCEPTED",
            "actor": user.name or "Care Home",
            "timestamp": now_str,
            "note": "Donation verified and accepted.",
        })
    else:
        new_status = "rejected"
        timeline.append({
            "status": "REJECTED",
            "actor": user.name or "Care Home",
            "timestamp": now_str,
            "note": f"Rejected. Reason: {payload.rejection_reason or 'Failed inspection guidelines'}",
        })

    photos = data.get("photos", {})
    photos["after"] = payload.inspection_photos

    don_ref.update({
        "status": new_status,
        "photos": photos,
        "inspection_notes": payload.notes,
        "timeline": timeline,
    })

    log_audit_event(
        action=f"DONATION_{payload.action}",
        actor_id=user.uid,
        actor_role=user.role,
        is_ai_action=False,
        details={
            "donation_id": payload.donation_id,
            "action": payload.action,
            "photo_count": len(payload.inspection_photos),
        },
    )

    return {"success": True, "status": new_status, "timeline": timeline}
