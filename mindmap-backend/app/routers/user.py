from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import User, InscribedStudents, Class
from app.services import user_service
from app.auth import verify_firebase_token
from app.dependency import get_current_user

router = APIRouter()

#get all users, skip and limit parameters default to 0 and 100 respectively, requires admin role
@router.get("/")
def get_users(role: Optional[str] = None, db:Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role !="admin":
        raise HTTPException(status_code=403, detail="Not authorized to view all users")

    users = user_service.get_all_users(db)
    return users

#gets the role of the current authenticated user
@router.get("/role")
def get_user_role(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "role": current_user.role
    }


#get user by specific id requires admin role or to be the current users own profile
@router.get("/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.user_id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this users")
    
    user = user_service.get_user_by_uid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

#update user profile, non admins may only update their own profile, and only admins may change roles
@router.put("/{user_id}")
def update_user(user_id: str, user_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.user_id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this user")
    
    allowed_fields = {"username", "email"}
    if current_user.role == "admin":
        allowed_fields.add("role")
    
    filtered_data = {k: v for k, v in user_data.items() if k in allowed_fields} #input validation ensure only allowed fields are updated
    
    updated_user = user_service.update_user(db, user_id, filtered_data)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return updated_user

#get all classes a user is apart of
@router.get("/{user_id}/classes")
def get_user_classes(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is requesting their own classes or is instructor/admin
    if current_user.user_id != user_id and current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these classes")
    
    user = user_service.get_user_by_uid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    classes = db.query(Class).join(
        InscribedStudents,
        Class.class_id == InscribedStudents.class_id
    ).filter(
        InscribedStudents.user_id == user_id
    ).all()
    
    return classes

#enroll a user in a class
@router.post("/{user_id}/enroll")
def enroll_in_class(user_id: str, class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # Validate user and class
    user = user_service.get_user_by_uid(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Check if already enrolled
    existing_enrollment = db.query(InscribedStudents).filter(
        InscribedStudents.user_id == user_id,
        InscribedStudents.class_id == class_id
    ).first()
    
    if existing_enrollment:
        return {"message": "User already enrolled in this class"}
    
    # Create enrollment
    new_enrollment = InscribedStudents(user_id=user_id, class_id=class_id)
    db.add(new_enrollment)
    db.commit()
    
    return {"message": "User successfully enrolled in class"}

#unenroll a user in a class
@router.delete("/{user_id}/unenroll/{class_id}")
def unenroll_from_class(user_id: str, class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check authorization
    if current_user.user_id != user_id and current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to unenroll this user")
    
    # Check if enrollment exists
    enrollment = db.query(InscribedStudents).filter(
        InscribedStudents.user_id == user_id,
        InscribedStudents.class_id == class_id
    ).first()
    
    if not enrollment:
        raise HTTPException(status_code=404, detail="User is not enrolled in this class")
    
    # Remove enrollment
    db.delete(enrollment)
    db.commit()
    
    return {"message": "User successfully unenrolled from class"}




