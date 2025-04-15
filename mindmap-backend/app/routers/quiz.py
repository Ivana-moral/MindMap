from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.db.database import get_db
from app.db.models import User, Material, InscribedStudents, Lesson
from app.services.spaced_repetition import SpacedRepetitionService
from app.dependency import get_current_user

router = APIRouter()

# Return personalized quiz for a lesson based on users lesson progress 
# Model syntax http://127.0.0.1:8000/api/quiz/lessons/1/quiz?quiz_size=20
# Returns current lesson progress and an array of selected questions based on users lesson progress and mastery
# EX. "questions": [
#        {
#           "material_id": 905,
#            "lesson_id": 1,
#            "type": "grammar",
#            "prompt": "Funny boy",
#            "answer": "El chico (cómico)",
#            "grammar_type": "Biological Gender Examples"
#        },
#{
#            "material_id": 47,
#            "lesson_id": 1,
#            "type": "vocabulary",
#            "word": "ocupado o ocupada",
#            "answer": "busy, occupied",
#            "prompt": "What is the meaning of: ocupado o ocupada?"
#        }
#       ] etc up to quiz size, max is 30 right now
@router.get("/lessons/{lesson_id}/quiz")
def get_quiz_for_lesson(
    lesson_id: int,
    quiz_size: int = Query(10, ge=3, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class (if user is a student)
    if current_user.role == "student":
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    # Get quiz questions using spaced repetition service
    questions = SpacedRepetitionService.get_quiz_session_for_lesson(
        db, 
        current_user.user_id, 
        lesson_id, 
        quiz_size
    )
    
    # Check if we have any questions
    if not questions:
        raise HTTPException(status_code=404, detail="No materials found for this lesson")
    
    # Get lesson progress stats
    progress = SpacedRepetitionService.get_lesson_progress_stats(db, current_user.user_id, lesson_id)
    
    return {
        "lesson_id": lesson_id,
        "lesson_name": lesson.lesson_name,
        "quiz_size": len(questions),
        "progress": progress,
        "questions": questions
    }

#Route for users to submit an answer, expects a body like this, difficulty rating can be based off of user attempts, AGAIN means failed to answer, then it goes HARD GOOD EASY,
# is currently hardcoded difficulty rating but can change as needed
#Ex. body {
#    "material_id": 1,
#    "lesson_id": 1,
#    "was_correct": true,
#    "difficulty_rating": "GOOD"
#}
@router.post("/submit-answer")
def submit_quiz_answer(
    answer_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate required fields
    required_fields = ["material_id", "lesson_id", "was_correct"]
    for field in required_fields:
        if field not in answer_data:
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    material_id = answer_data["material_id"]
    lesson_id = answer_data["lesson_id"]
    was_correct = answer_data["was_correct"]
    difficulty_rating = answer_data.get("difficulty_rating", "GOOD")
    
    valid_ratings = ["AGAIN", "HARD", "GOOD", "EASY"]
    if difficulty_rating not in valid_ratings:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid difficulty rating. Must be one of: {', '.join(valid_ratings)}"
        )
    
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    if material.lesson_id != lesson_id:
        raise HTTPException(status_code=400, detail="Material does not belong to this lesson")
    
    # Check if user has access to the lesson's class (if user is a student)
    if current_user.role == "student":
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    # Update understanding with daily caps
    updated_data = SpacedRepetitionService.update_material_understanding(
        db,
        current_user.user_id,
        material_id,
        lesson_id,
        was_correct,
        difficulty_rating
    )
    
    # Get updated lesson progress
    progress = SpacedRepetitionService.get_lesson_progress_stats(db, current_user.user_id, lesson_id)
    
    return {
        "material_id": material_id,
        "lesson_id": lesson_id,
        "was_correct": was_correct,
        "difficulty_rating": difficulty_rating,
        "understanding_level": updated_data.level_of_understanding,
        "times_studied": updated_data.times_studied,
        "last_seen": updated_data.date_last_seen.isoformat(),
        "lesson_progress": progress
    }

#Gets users progress for a specific lesson
@router.get("/lessons/{lesson_id}/progress")
def get_lesson_progress(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Check if user has access to the lesson's class (if user is a student)
    if current_user.role == "student":
        enrollment = db.query(InscribedStudents).filter(
            InscribedStudents.user_id == current_user.user_id,
            InscribedStudents.class_id == lesson.class_id
        ).first()
        
        if not enrollment:
            raise HTTPException(status_code=403, detail="Not enrolled in the class this lesson belongs to")
    
    # Get progress stats
    progress = SpacedRepetitionService.get_lesson_progress_stats(db, current_user.user_id, lesson_id)
    
    return {
        "lesson_id": lesson_id,
        "lesson_name": lesson.lesson_name,
        "progress": progress
    }