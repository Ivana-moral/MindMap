from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import User, InscribedStudents, Class
from app.services import user_service
router = APIRouter()

@router.get("/users")
def get_users(role: Optional[str] = None, db:Session = Depends(get_db)):
    users = db.query(User)

    if(role):
        users.filter(User.role == role)
    
    return users.limit(100).all()

@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    user = user_service.get_user_by_uid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user