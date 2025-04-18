from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Class
from app.services import class_service
from app.dependency import get_current_user

router = APIRouter()

#Get all classes (may add role restrictions later) skip and limit parameters default to 0 and 100 respectively
@router.get("/classes")
def get_classes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    classes = class_service.get_all_classes(db, skip, limit)
    return classes

#Create a new class (Admin/Instructor role)
@router.post("/classes")
def create_class(
    class_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can create classes")
    
    class_name = class_data.get("class_name")
    if not class_name:
        raise HTTPException(status_code=400, detail="Class name is required")
    
    new_class = class_service.create_class(db, class_name)
    return new_class

#Get class by class id
@router.get("/classes/{class_id}")
def get_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    class_obj = class_service.get_class_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return class_obj

#update a class (Admin/Instructor role)
@router.put("/classes/{class_id}")
def update_class(class_id: int, class_data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can update classes")
    
    updated_class = class_service.update_class(db, class_id, class_data)
    if not updated_class:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return updated_class

#delete a class (requires admin)
@router.delete("/classes/{class_id}")
def delete_class(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete classes")
    
    success = class_service.delete_class(db, class_id)
    if not success:
        raise HTTPException(status_code=404, detail="Class not found")
    
    return {"message": "Class successfully deleted"}

#get all students in a class (Admin/Instructor role)
@router.get("/classes/{class_id}/students")
def get_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can view class students")
    
    # Check if the class exists
    class_obj = class_service.get_class_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    students = class_service.get_class_students(db, class_id)
    return students

#get all lessons for a class
@router.get("/classes/{class_id}/lessons")
def get_class_lessons(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if the class exists
    class_obj = class_service.get_class_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    lessons = class_service.get_class_lessons(db, class_id)
    return lessons