# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.services import user_service
from app.auth import verify_firebase_token, create_test_id_token
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

#Generate test token for development mode
@router.get("/test-token/{user_id}")
def get_test_token(user_id: str, email: str = "test@example.com"):
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
            "note": "Use when  API is in development mode"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test token: {str(e)}")
    
#Route including role assignment for get test-token    
@router.get("/test-token/{role}/{identifier}")
def get_test_token(role: str, identifier: str):
    if os.getenv("ENVIRONMENT") != "development":
        raise HTTPException(status_code=403, detail="This endpoint is only available in development mode")
    
    # Validate role
    valid_roles = ["admin", "instructor", "student"]
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Use one of: {', '.join(valid_roles)}")
    
    # Generate unique identifiers using the provided identifier
    user_id = f"test-{role}-{identifier}"
    email = f"{role}.{identifier}@example.com"
    username = f"{role}_{identifier}"
    
    try:
        # Create test token with the unique identifiers
        token = create_test_id_token(user_id, email)
        
        # Add the test_token flag to help with verification
        payload = {
            "uid": user_id,
            "email": email,
            "username": username,
            "role": role,
            "test_token": True,
            "exp": int(time.time()) + 3600  # 1 hour expiration
        }
        
        secret = "test-secret-key-for-development-only"
        token = jwt.encode(payload, secret, algorithm="HS256")
        
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        
        return {
            "user_id": user_id,
            "email": email,
            "username": username,
            "role": role,
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating test token: {str(e)}")