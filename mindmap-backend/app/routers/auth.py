# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.services import user_service
from app.auth import verify_firebase_token
import jwt
import time
from datetime import datetime, timedelta
import os

router = APIRouter()

@router.post("/login")
def login(token: str, db: Session = Depends(get_db)):
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

@router.get("/test-token/{user_id}")
def get_test_token(user_id: str, email: str = "test@example.com"):
    """Generate a test token for development - NOT FOR PRODUCTION"""
    if os.getenv("ENVIRONMENT") != "development":
        raise HTTPException(status_code=403, detail="This endpoint is only available in development mode")
    
    try:
        # Create a test token with the special test_token flag
        payload = {
            "uid": user_id,
            "email": email,
            "test_token": True,
            "exp": int(time.time()) + 3600  # 1 hour expiration
        }
        
        # Simple secret for development only
        secret = "test-secret-key-for-development-only"
        token = jwt.encode(payload, secret, algorithm="HS256")
        
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        return {
            "user_id": user_id,
            "token": token,
            "note": "This token can be used directly with your API in development mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test token: {str(e)}")