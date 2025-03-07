# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.services import user_service
from app.auth import verify_firebase_token

router = APIRouter()

@router.post("/login")
async def login(token: str, db: Session = Depends(get_db)):
    # Verify the Firebase ID token and get user data
    firebase_uid, email = verify_firebase_token(token)
    
    # Check if user exists in database
    user = user_service.get_user_by_uid(db, firebase_uid)
    
    if not user:
        # Create a new user if they don't exist
        user = user_service.create_user(db, firebase_uid, email)
    else:
        # Update last login
        user_service.update_last_login(db, user.user_id)
    
    return {
        "message": "User logged in",
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email
    }