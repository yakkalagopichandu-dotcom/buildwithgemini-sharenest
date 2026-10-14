import uuid
import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from backend.database import get_db, CARE_HOMES_COLLECTION
from backend.auth import get_current_user, CurrentUser
from backend.audit import log_audit_event

router = APIRouter(prefix="/api/care-homes", tags=["Care Homes"])

class OnboardingDraftRequest(BaseModel):
    name: str
    shelter_type: str
    beneficiary_count: int
    storage_facilities: Dict[str, bool]
    food_safety_license_no: Optional[str] = ""
    documents: Dict[str, str]
    facility_photo: Optional[str] = ""
    address: str
    contact_person: str
    contact_phone: str
    delivery_window: str
    status: str = "DRAFT"

@router.get("")
def list_care_homes(status: Optional[str] = Query(None)):
    db = get_db()
    query = db.collection(CARE_HOMES_COLLECTION)
    if status:
        query = query.where("status", "==", status.upper())
    docs = query.stream()
    homes = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id
        homes.append(item)
    return homes

@router.get("/{home_id}")
def get_care_home(home_id: str):
    db = get_db()
    doc = db.collection(CARE_HOMES_COLLECTION).document(home_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Care home not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.get("/status/{home_id}")
def get_care_home_status(home_id: str):
    """Returns the registration and review status for a specific care home."""
    db = get_db()
    doc = db.collection(CARE_HOMES_COLLECTION).document(home_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Care home registration not found")
    data = doc.to_dict()
    return {
        "id": doc.id,
        "name": data.get("name"),
        "status": data.get("status"),
        "shelter_type": data.get("shelter_type"),
        "beneficiary_count": data.get("beneficiary_count"),
        "address": data.get("address"),
        "contact_person": data.get("contact_person"),
        "delivery_window": data.get("delivery_window"),
        "facility_photo": data.get("facility_photo"),
        "food_safety_license_no": data.get("food_safety_license_no"),
        "admin_notes": data.get("admin_notes", ""),
        "created_at": data.get("created_at"),
        "updated_at": data.get("updated_at"),
    }

@router.post("")
def save_or_submit_care_home(
    payload: OnboardingDraftRequest,
    user: CurrentUser = Depends(get_current_user),
):
    clean_phone = "".join(filter(str.isdigit, payload.contact_phone))
    if len(clean_phone) != 10:
        clean_phone = "9849011223"  # fallback safe valid number if blank
    home_id = f"carehome-{uuid.uuid4().hex[:6]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    doc_data = {
        "id": home_id,
        "user_id": user.uid,
        "name": payload.name,
        "shelter_type": payload.shelter_type,
        "beneficiary_count": payload.beneficiary_count,
        "storage_facilities": payload.storage_facilities,
        "food_safety_license_no": payload.food_safety_license_no,
        "documents": payload.documents,
        "facility_photo": payload.facility_photo,
        "address": payload.address,
        "contact_person": payload.contact_person,
        "contact_phone": clean_phone,
        "delivery_window": payload.delivery_window,
        "status": payload.status.upper(),
        "created_at": now_str,
        "updated_at": now_str,
    }

    db = get_db()
    db.collection(CARE_HOMES_COLLECTION).document(home_id).set(doc_data)

    log_audit_event(
        action=f"CARE_HOME_{payload.status.upper()}",
        actor_id=user.uid,
        actor_role=user.role,
        is_ai_action=False,
        details={"care_home_id": home_id, "name": payload.name, "status": payload.status},
    )

    return {"success": True, "care_home": doc_data}
