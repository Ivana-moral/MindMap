from sqlalchemy.orm import Session
from app.db.models import Class, InscribedStudents, Lesson, User
from typing import List, Optional

def get_all_classes(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Class).offset(skip).limit(limit).all()

def get_class_by_id(db: Session, class_id: int):
    return db.query(Class).filter(Class.class_id == class_id).first()

def create_class(db: Session, class_name: str):
    new_class = Class(class_name=class_name)
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

def update_class(db: Session, class_id: int, class_data: dict):
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        return None
    
    for key, value in class_data.items():
        if hasattr(class_obj, key) and key != "class_id":
            setattr(class_obj, key, value)
    
    db.commit()
    db.refresh(class_obj)
    return class_obj

def delete_class(db: Session, class_id: int):
    class_obj = db.query(Class).filter(Class.class_id == class_id).first()
    if not class_obj:
        return False
    
    db.delete(class_obj)
    db.commit()
    return True

def get_class_students(db: Session, class_id: int):
    return db.query(User).join(
        InscribedStudents,
        User.user_id == InscribedStudents.user_id
    ).filter(
        InscribedStudents.class_id == class_id
    ).all()

def get_class_lessons(db: Session, class_id: int):
    return db.query(Lesson).filter(Lesson.class_id == class_id).all()