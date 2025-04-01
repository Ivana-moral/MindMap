from sqlalchemy.orm import Session
from app.db.models import Lesson, Material, LessonLog, UserMaterialData
from typing import List, Optional
import uuid
from datetime import date

def get_all_lessons(db: Session, class_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(Lesson)
    
    if class_id:
        query = query.filter(Lesson.class_id == class_id)
    
    return query.offset(skip).limit(limit).all()

def get_lesson_by_id(db: Session, lesson_id: int):
    return db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()

def create_lesson(db: Session, lesson_name: str, lesson_number: float, class_id: int):
    new_lesson = Lesson(
        lesson_name=lesson_name,
        lesson_number=lesson_number,
        class_id=class_id
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

def update_lesson(db: Session, lesson_id: int, lesson_data: dict):
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        return None
    
    for key, value in lesson_data.items():
        if hasattr(lesson, key) and key != "lesson_id":
            setattr(lesson, key, value)
    
    db.commit()
    db.refresh(lesson)
    return lesson

def delete_lesson(db: Session, lesson_id: int):
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        return False
    
    db.delete(lesson)
    db.commit()
    return True

def get_lesson_materials(db: Session, lesson_id: int):
    return db.query(Material).filter(Material.lesson_id == lesson_id).all()

def log_lesson_completion(db: Session, user_id: str, lesson_id: int, material_results: list):
    """
    Log a lesson completion, calculating overall success based on material results.
    
    Parameters:
    - db: Database session
    - user_id: User's Firebase UID
    - lesson_id: The lesson ID being completed
    - material_results: List of dictionaries with material_id and was_correct values
    
    Returns:
    - The created LessonLog entry
    """
    # Calculate success rate across all materials
    total_materials = len(material_results)
    if total_materials == 0:
        return None
        
    correct_materials = sum(1 for result in material_results if result.get('was_correct'))
    success_rate = correct_materials / total_materials
    
    # Determine if the lesson was completed successfully (e.g., 70% threshold)
    COMPLETION_THRESHOLD = 0.7
    was_correct = success_rate >= COMPLETION_THRESHOLD
    
    # Calculate average time taken
    total_time = sum(result.get('time_taken', 0) for result in material_results)
    average_time = total_time / total_materials if total_materials > 0 else 0
    
    # Create the lesson log entry
    attempt_id = str(uuid.uuid4())
    lesson_log = LessonLog(
        attempt_id=attempt_id,
        user_id=user_id,
        lesson_id=lesson_id,
        attempt_date=date.today(),
        was_correct=was_correct,
        time_taken=average_time
    )
    
    db.add(lesson_log)
    
    # Update individual material data
    for result in material_results:
        material_id = result.get('material_id')
        was_correct = result.get('was_correct', False)
        time_taken = result.get('time_taken', 0)
        
        # Track individual material interaction
        material_service.track_material_interaction(
            db, user_id, lesson_id, material_id, was_correct
        )
    
    db.commit()
    db.refresh(lesson_log)
    
    return lesson_log