from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Lesson, InscribedStudents, Material
from app.services import lesson_service, class_service
from app.dependency import get_current_user

router = APIRouter()

#Get all lessons, can filter by class
@router.get("/lessons")
def get_lessons(class_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user has access to the class
    if class_id and current_user.role == "student":
        # Check if student is enrolled in the class
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in this class")
    
    lessons = lesson_service.get_all_lessons(db, class_id, skip, limit)
    return lessons


#Create a new lesson (Admin/Instructor role)
@router.post("/lessons")
def create_lesson(
    lesson_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can create lessons")
    
    # Validate required fields
    required_fields = ["lesson_name", "lesson_number", "class_id"]
    for field in required_fields:
        if field not in lesson_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Check if the class exists
    class_obj = class_service.get_class_by_id(db, lesson_data["class_id"])
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
    
    new_lesson = lesson_service.create_lesson(
        db, 
        lesson_data["lesson_name"], 
        lesson_data["lesson_number"], 
        lesson_data["class_id"]
    )
    
    return new_lesson

#Get lesson by lesson id (Student role allowed only if enrolled in the lessons class, otherwise Admin/Instructor)
@router.get("/lessons/{lesson_id}")
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class
    if current_user.role == "student":
        # Check if student is enrolled in the class
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    return lesson

#Update a lesson by lesson id, (instructor and admin role only)
@router.put("/lessons/{lesson_id}")
def update_lesson(
    lesson_id: int,
    lesson_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can update lessons")
    
    # Check if lesson exists
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Update lesson
    updated_lesson = lesson_service.update_lesson(db, lesson_id, lesson_data)
    return updated_lesson

#Delete a lesson by lesson id (Admin only)
@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete lessons")
    
    # Check if lesson exists and delete it
    success = lesson_service.delete_lesson(db, lesson_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    return {"message": "Lesson successfully deleted"}

#Get materials for a specific lesson by lesson id (Student allowed if enrolled in class)
@router.get("/lessons/{lesson_id}/materials")
def get_lesson_materials(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if lesson exists
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class
    if current_user.role == "student":
        # Check if student is enrolled in the class
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    materials = lesson_service.get_lesson_materials(db, lesson_id)
    return materials

#Log the current users lesson attempt by lesson id
@router.post("/lessons/{lesson_id}/log-attempt")
def log_lesson_attempt(
    lesson_id: int,
    attempt_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if lesson exists
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Validate required fields
    if "was_correct" not in attempt_data or "time_taken" not in attempt_data:
        raise HTTPException(status_code=400, detail="Missing required fields: was_correct, time_taken")
    
    # Log the attempt
    log = lesson_service.log_lesson_attempt(
        db,
        current_user.user_id,
        lesson_id,
        attempt_data["was_correct"],
        attempt_data["time_taken"]
    )
    
    return log

#Get all grammar for a specific lesson
@router.get("/lessons/{lesson_id}/grammar")
def get_lesson_grammar(lesson_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    # Check if lesson exists
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class
    if current_user.role == "student":
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    # Get grammar materials
    grammar_materials = db.query(Material).filter(
        Material.lesson_id == lesson_id,
        Material.type_of_material == "grammar"
    ).all()
    
    return grammar_materials

#Get all vocab for a specific lesson
@router.get("/lessons/{lesson_id}/vocabulary")
def get_lesson_vocabulary(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    # Check if lesson exists
    lesson = lesson_service.get_lesson_by_id(db, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class
    if current_user.role == "student":
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    # Get vocabulary materials
    vocabulary_materials = db.query(Material).filter(
        Material.lesson_id == lesson_id,
        Material.type_of_material == "vocabulary"
    ).all()
    
    return vocabulary_materials