import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from backend.database import get_db, DONATIONS_COLLECTION
from backend.auth import get_current_user, CurrentUser
from backend.audit import log_audit_event

router = APIRouter(prefix="/api/donations", tags=["Donations"])

class CreateDonationRequest(BaseModel):
    title: str
    category: str
    quantity: str
    location: str
    pickup_window: str
    urgency: str = "medium"
    notes: Optional[str] = ""
    safe_until: Optional[str] = None
    allergens: Optional[List[str]] = []
    handover_method: str = "IN_PERSON"
    before_photos: Optional[List[str]] = []
    subcategory: Optional[str] = None

class ConfirmActionRequest(BaseModel):
    action: str
    confirmed: bool

@router.get("")
def list_all_donations(
    category: Optional[str] = Query(None),
    subcategory: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    urgency: Optional[str] = Query(None),
    limit: int = Query(30),
):
    db = get_db()
    query = db.collection(DONATIONS_COLLECTION)
    
    docs = query.limit(limit).stream()
    items = []
    for d in docs:
        item = d.to_dict()
        item["id"] = d.id

        # Subcategory match (e.g. "cooked-meals", "rice-grains")
        if subcategory:
            item_subcat = item.get("subcategory", "")
            if item_subcat != subcategory and item.get("id") != subcategory:
                continue

        # Category match (e.g. "Food", "Clothes", "Toys", "Essentials")
        if category:
            item_cat = str(item.get("category", "")).lower()
            if item_cat != category.strip().lower():
                continue

        # Status match
        if status and item.get("status", "") != status.strip():
            continue

        # Urgency match
        if urgency and str(item.get("urgency", "")).lower() != urgency.strip().lower():
            continue

        items.append(item)
    return items

@router.get("/{donation_id}")
def get_donation(donation_id: str):
    db = get_db()
    doc = db.collection(DONATIONS_COLLECTION).document(donation_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Donation not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data

@router.post("")
def create_donation(
    payload: CreateDonationRequest,
    user: CurrentUser = Depends(get_current_user),
):
    db = get_db()
    donation_id = f"donation-{uuid.uuid4().hex[:6]}"
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # Generate 6-digit verification handover PIN
    import random
    handover_code = f"{random.randint(100000, 999999)}"

    # Provide authentic high-res fallback image based on category
    category_fallbacks = {
        "Food": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
        "Clothes": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
        "Toys": "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80",
        "Essentials": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80",
    }
    fallback_img = category_fallbacks.get(payload.category, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80")
    photos_list = payload.before_photos if payload.before_photos else [fallback_img]

    data = {
        "id": donation_id,
        "donor_id": user.uid,
        "title": payload.title,
        "category": payload.category,
        "subcategory": payload.subcategory or "cooked-meals",
        "quantity": payload.quantity,
        "location": payload.location,
        "pickup_window": payload.pickup_window,
        "urgency": payload.urgency,
        "notes": payload.notes or "",
        "safe_until": payload.safe_until,
        "allergens": payload.allergens,
        "handover_method": payload.handover_method,
        "status": "available",
        "handover_code": handover_code,
        "photos": {
            "before": photos_list,
            "after": [],
        },
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    db.collection(DONATIONS_COLLECTION).document(donation_id).set(data)
    
    log_audit_event(
        action="CREATE_DONATION",
        actor_id=user.uid,
        actor_role=user.role,
        is_ai_action=False,
        details={"donation_id": donation_id, "title": payload.title, "quantity": payload.quantity},
    )
    
    return data
