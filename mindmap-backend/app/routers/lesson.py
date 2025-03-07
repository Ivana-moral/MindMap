from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import Lesson, Material, UserMaterialData, LessonLog
import uuid
from datetime import date, datetime

router = APIRouter()

@router.get("/lessons")
def get_lessons(db: Session = Depends(get_db), class_id: Optional[int] = None):
    """Get all lessons or filter by class_id"""
    query = db.query(Lesson)
    if class_id:
        query = query.filter(Lesson.class_id == class_id)
    return query.all()