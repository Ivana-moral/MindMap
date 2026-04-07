from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.db.models import User, Class
from app.services import class_service, spaced_repetition
from app.dependency import get_current_user

router = APIRouter()

#get all students in a class (Admin/Instructor role)
@router.get("/{class_id}")
def get_class_students(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print(current_user.role)
    if current_user.role not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Only instructors and admins can view class students")
    
    class_obj = class_service.get_class_by_id(db, class_id)
    if not class_obj:
        raise HTTPException(status_code=404, detail="class not found")
    
    students = class_service.get_students_by_class(db, class_id)
    lessons = class_service.get_class_lessons(db, class_id)
    result = []

    for student in students:
        lesson_stat = []
        for lesson in lessons:
            progress = spaced_repetition.SpacedRepetitionService.get_lesson_progress_stats(db,student.user_id,lesson.lesson_id)
            lesson_stat.append({
                "lesson_id": lesson.lesson_id,
                "lesson_name": lesson.lesson_name,
                "lesson_number": lesson.lesson_number,
                "class_id": lesson.class_id,
                "mastered" : progress["percent_mastered"],
                "completed" : progress["percent_complete"]
            })

        result.append({
            "user_id" : student.user_id,
            "username" : student.username,
            "user_role" : student.role,
            "user_email" : student.email,
            "display_name": student.display_name,
            "lessons": lesson_stat
        })           

    return result
