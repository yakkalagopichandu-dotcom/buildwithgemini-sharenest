import uuid
import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.database import get_db, USERS_COLLECTION, CARE_HOMES_COLLECTION
from backend.audit import log_audit_event

router = APIRouter(prefix="/api/auth", tags=["User Registration & Auth"])

class RegisterUserRequest(BaseModel):
    role: str  # "DONOR" or "CARE_HOME"
    name: str
    email: Optional[str] = ""
    mobile: str
    address: str
    # Specific fields for CARE_HOME:
    shelter_type: Optional[str] = "orphanage"
    beneficiary_count: Optional[int] = 20
    food_safety_license_no: Optional[str] = ""
    contact_person: Optional[str] = ""
    delivery_window: Optional[str] = "10:00 AM - 6:00 PM"
    storage_facilities: Optional[Dict[str, bool]] = None
    documents: Optional[Dict[str, str]] = None
    facility_photo: Optional[str] = ""

@router.post("/register")
def register_user(payload: RegisterUserRequest):
    valid_roles = ["DONOR", "CARE_HOME"]
    role = payload.role.strip().upper()
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail="Role must be either DONOR or CARE_HOME")

    if not payload.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    clean_mobile = "".join(filter(str.isdigit, payload.mobile))
    if len(clean_mobile) != 10:
        raise HTTPException(status_code=400, detail="Contact phone number must be exactly 10 digits (numbers only).")

    db = get_db()
    user_id = f"user-{uuid.uuid4().hex[:6]}"
    now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

    user_data = {
        "uid": user_id,
        "name": payload.name.strip(),
        "email": payload.email.strip() if payload.email else "",
        "mobile": clean_mobile,
        "address": payload.address.strip(),
        "role": role,
        "is_verified": True if role == "DONOR" else False,
        "created_at": now_str,
    }

    db.collection(USERS_COLLECTION).document(user_id).set(user_data)

    care_home_data = None
    # If Care Home, create associated care home application record
    if role == "CARE_HOME":
        home_id = f"carehome-{uuid.uuid4().hex[:6]}"
        care_home_data = {
            "id": home_id,
            "user_id": user_id,
            "name": payload.name.strip(),
            "shelter_type": payload.shelter_type or "orphanage",
            "beneficiary_count": payload.beneficiary_count or 20,
            "storage_facilities": payload.storage_facilities or {
                "fridge": True,
                "freezer": False,
                "dry_storage": True,
                "kitchen": True,
                "power_backup": True,
            },
            "food_safety_license_no": payload.food_safety_license_no or "",
            "documents": payload.documents or {},
            "facility_photo": payload.facility_photo or "",
            "address": payload.address.strip(),
            "contact_person": payload.contact_person or payload.name.strip(),
            "contact_phone": clean_mobile,
            "delivery_window": payload.delivery_window or "10:00 AM - 6:00 PM",
            "status": "SUBMITTED",
            "created_at": now_str,
            "updated_at": now_str,
        }
        db.collection(CARE_HOMES_COLLECTION).document(home_id).set(care_home_data)

    log_audit_event(
        action=f"REGISTER_{role}",
        actor_id=user_id,
        actor_role=role,
        is_ai_action=False,
        details={
            "name": payload.name,
            "role": role,
            "care_home_id": care_home_data["id"] if care_home_data else None,
        },
    )

    return {
        "success": True,
        "user": user_data,
        "care_home": care_home_data,
    }
