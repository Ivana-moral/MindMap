import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.auth import verify_firebase_token
from app.services import user_service
from app.db.models import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
):
    try:
        user_id, email, display_name = verify_firebase_token(credentials.credentials)
        
        user = user_service.get_user_by_uid(db, user_id)

        # In dependency.py
        if not user:
            print(f"User {user_id} not found, attempting to create")
            # Auto-create test users
            if os.getenv("ENVIRONMENT") == "development" and user_id.startswith('test-'):
                print(f"Creating test user with id={user_id}, email={email}")
                try:
                    if 'admin' in user_id:
                        user = user_service.create_user(db, user_id, email, role="admin", display_name=display_name)
                        print(f"Created admin user: {user.user_id} with role {user.role}")
                    elif 'instructor' in user_id:
                        user = user_service.create_user(db, user_id, email, role="instructor", display_name=display_name)
                        print(f"Created instructor user: {user.user_id}")
                    else:
                        user = user_service.create_user(db, user_id, email, role="student", display_name=display_name)
                        print(f"Created student user: {user.user_id}")
                except Exception as e:
                    print(f"Error creating user: {str(e)}")
                    raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")
        
        return user
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def get_current_user_role (credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded_token = verify_firebase_token(credentials.credentials)
        user_role = decoded_token.get("role")
        return user_role
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="invalid authenticaion credentials",
            headers={"WWW-Authenticate": "Bearer"},
            )

def role_required(required_role: str):
    def role_checker(user_role:str = Depends(get_current_user_role)):
        if user_role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have the {required_role} role"
            )
        return user_role
    return role_checker