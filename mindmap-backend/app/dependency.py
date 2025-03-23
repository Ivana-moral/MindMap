import os
from fastapi import Depends, HTTPException
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
        user_id, _ = verify_firebase_token(credentials.credentials)
        
        user = user_service.get_user_by_uid(db, user_id)
        if not user:
            # Auto-create test users
            if os.getenv("ENVIRONMENT") == "development" and user_id.startswith('test-'):
                if 'admin' in user_id:
                    user = user_service.create_user(db, user_id, "admin@example.com", role="admin")
                else:
                    user = user_service.create_user(db, user_id, "student@example.com", role="student")
            else:
                raise HTTPException(status_code=404, detail="User not found")
        
        return user
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")