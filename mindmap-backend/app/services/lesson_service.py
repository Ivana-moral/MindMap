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
