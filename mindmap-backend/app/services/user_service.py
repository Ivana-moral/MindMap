# app/services/user_service.py
from sqlalchemy.orm import Session
from app.db.models import User
import datetime

def get_user_by_uid(db: Session, firebase_uid: str):
    return db.query(User).filter(User.user_id == firebase_uid).first()

def create_user(db: Session, firebase_uid: str, email: str, username: str = None, role: str = "student"):
    base_username = username or email.split('@')[0]
    
    username_attempt = base_username
    counter = 1
    
    # Keep iterating until we find a unique username
    while db.query(User).filter(User.username == username_attempt).first():
        # Username exists, try with a number appended
        username_attempt = f"{base_username}{counter}"
        counter += 1
    
    #guaurenteed unique username
    user = User(
        user_id=firebase_uid, 
        email=email,
        username=username_attempt,
        date_created=datetime.date.today(),
        last_login=datetime.date.today(),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_last_login(db: Session, user_id: str):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.last_login = datetime.date.today()
        db.commit()
        return True
    return False

def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: str, user_data: dict):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None
    
    for key, value in user_data.items():
        if hasattr(user, key) and key != "user_id":
            setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user

def get_user_role(db: Session, user_id: str):
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        return user.role
    return None