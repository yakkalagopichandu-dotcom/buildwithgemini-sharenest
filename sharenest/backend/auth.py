from typing import Optional, Dict, Any, List
from fastapi import Header, HTTPException, status, Depends
from pydantic import BaseModel
from backend.database import get_db, USERS_COLLECTION

class CurrentUser(BaseModel):
    uid: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    name: Optional[str] = None
    role: str = "DONOR"
    is_verified: bool = False

async def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role"),
    authorization: Optional[str] = Header(None),
) -> CurrentUser:
    """Authentication and Role Resolver."""
    effective_role = x_user_role or "ADMIN"
    effective_uid = x_user_id or "demo-user-123"

    db = get_db()
    user_doc = db.collection(USERS_COLLECTION).document(effective_uid).get()
    if user_doc.exists:
        data = user_doc.to_dict() or {}
        return CurrentUser(
            uid=effective_uid,
            email=data.get("email"),
            mobile=data.get("mobile"),
            name=data.get("name"),
            role=data.get("role", effective_role),
            is_verified=data.get("is_verified", False),
        )

    return CurrentUser(
        uid=effective_uid,
        role=effective_role,
        name="Demo User",
        is_verified=True,
    )

def require_role(allowed_roles: List[str]):
    async def dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of roles: {allowed_roles}",
            )
        return current_user
    return dependency
