import re
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from app.db.models import UserMaterialData, Material, User, Lesson
from typing import List, Dict, Any, Optional
import math
import random

class SpacedRepetitionService:
    MIN_INTERVAL = 1  
    MAX_INTERVAL = 180  
    
    # Ease factors for different performance levels OBSOLETE
    EASE_FACTORS = {
        "AGAIN": 0.7,  # User got it wrong
        "HARD": 0.8,   # User struggled but got it right
        "GOOD": 1.0,   # User knew it well
        "EASY": 1.2    # User found it very easy
    }
    
    # Understanding level thresholds
    MASTERY_THRESHOLD = 0.8  # Material is considered "mastered" at this level
    REVIEW_SOON_THRESHOLD = 0.5  # Material should be reviewed soon at this level
    REVIEW_NOW_THRESHOLD = 0.3  # Material should be reviewed immediately at this level
    
    # Daily progress caps
    MAX_DAILY_UNDERSTANDING_INCREASE = 0.3  # Maximum understanding increase per day
    
    @staticmethod
    def calculate_review_priority(level_of_understanding: float, days_since_last_review: int, times_studied: int) -> float:
        priority = 1.0 - level_of_understanding
        time_factor = min(1.0, days_since_last_review/30)
        priority += time_factor * .5
        
        if times_studied <= 2:
            priority += .2
        
        priority = min(1.0, max(0.0, priority))
        
        return priority
    
    @staticmethod
    def apply_forgetting_curve(level_of_understanding: float, days_since_last_review: int) -> float:
        #Ebbinghaus forgetting curve: R = e^(-t/S)
        strength = 20*level_of_understanding+1
        
        retention = math.exp(-days_since_last_review/strength)
        
        forgor = level_of_understanding*retention
        
        forgor = max(.1, min(1.0, forgor))
        
        return forgor
        
    @staticmethod
    def get_due_materials(db: Session, user_id: str, lesson_id: Optional[int] = None, limit: int=20) -> List[Dict[str, Any]]:
        query = db.query(UserMaterialData).filter(UserMaterialData.user_id == user_id)
        
        if(lesson_id is not None):
            query = query.filter(UserMaterialData.lesson_id == lesson_id)
        
        user_materials = query.all()
        
        today = datetime.now().date()
        due_materials = []
        
        for user_material in user_materials:
            days_since_last_review = (today - user_material.date_last_seen).days
            
            current_level = SpacedRepetitionService.apply_forgetting_curve(user_material.level_of_understanding, days_since_last_review)
            
            priority = SpacedRepetitionService.calculate_review_priority(current_level, days_since_last_review, user_material.times_studied)
            
            material = db.query(Material).filter(Material.material_id == user_material.material_id).first()
            
            due_materials.append({
                "material": material,
                "material_id": user_material.material_id,
                "lesson_id": user_material.lesson_id,
                "days_since_review": days_since_last_review,
                "original_understanding": user_material.level_of_understanding,
                "estimated_current_understanding": current_level,
                "times_studied": user_material.times_studied,
                "priority": priority
            })
        
        due_materials.sort(key=lambda x: x["priority"])
        
        return due_materials[:limit]
        
    @staticmethod
    def get_new_materials(db: Session, user_id: str, lesson_id: Optional[int] = None, limit: int = 10) -> List[Dict[str, Any]]:
        studied_material_ids = db.query(UserMaterialData.material_id).filter(UserMaterialData.user_id == user_id).all()
        
        studied_material_ids = [item[0] for item in studied_material_ids]
        
        query = db.query(Material).filter(
            ~Material.material_id.in_(studied_material_ids) if studied_material_ids else True
        )
            
        if lesson_id is not None:
            query = query.filter(Material.lesson_id == lesson_id)
            
        new_materials = query.limit(limit).all()
            
        return [{"material": material, "material_id": material.material_id, "lesson_id": material.lesson_id}
                for material in new_materials]
    
    #Equal Grammar and vocab
    @staticmethod
    def get_quiz_session(db: Session, user_id: str, lesson_id: int, session_size: int = 10) -> List[Dict[str, Any]]:
        lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
        if not lesson:
            return []
        
        vocab_target = session_size // 2
        grammar_target = session_size - vocab_target
        
        user_materials = db.query(UserMaterialData).filter(
            UserMaterialData.user_id == user_id,
            UserMaterialData.lesson_id == lesson_id
        ).all()
        
        today = datetime.now().date()
        material_priorities = {}
        
        for um in user_materials:
            days_since_last_review = (today - um.date_last_seen).days
            current_level = SpacedRepetitionService.apply_forgetting_curve(
                um.level_of_understanding, 
                days_since_last_review
            )
            priority = SpacedRepetitionService.calculate_review_priority(
                current_level,
                days_since_last_review,
                um.times_studied
            )
            material_priorities[um.material_id] = {
                "priority": priority,
                "days_since_review": days_since_last_review,
                "original_understanding": um.level_of_understanding,
                "estimated_current_understanding": current_level,
                "times_studied": um.times_studied
            }
        
        vocab_materials = db.query(Material).filter(
            Material.lesson_id == lesson_id,
            Material.type_of_material == "vocabulary"
        ).all()
        
        grammar_materials = db.query(Material).filter(
            Material.lesson_id == lesson_id,
            Material.type_of_material == "grammar"
        ).all()
        
        studied_vocab = [m for m in vocab_materials if m.material_id in material_priorities]
        new_vocab = [m for m in vocab_materials if m.material_id not in material_priorities]
        
        studied_grammar = [m for m in grammar_materials if m.material_id in material_priorities]
        new_grammar = [m for m in grammar_materials if m.material_id not in material_priorities]
        
        studied_vocab.sort(key=lambda m: material_priorities[m.material_id]["priority"])
        studied_grammar.sort(key=lambda m: material_priorities[m.material_id]["priority"])
        
        selected_vocab = []
        
        vocab_review_count = min(int(vocab_target * 0.7), len(studied_vocab))
        for m in studied_vocab[:vocab_review_count]:
            selected_vocab.append({
                "material": m,
                "material_id": m.material_id,
                "lesson_id": lesson_id,
                **material_priorities[m.material_id]
            })
        
        vocab_new_count = min(vocab_target - len(selected_vocab), len(new_vocab))
        for m in random.sample(new_vocab, vocab_new_count) if vocab_new_count > 0 and new_vocab else []:
            selected_vocab.append({
                "material": m,
                "material_id": m.material_id,
                "lesson_id": lesson_id
            })
        
        remaining_vocab = vocab_target - len(selected_vocab)
        if remaining_vocab > 0 and len(studied_vocab) > vocab_review_count:
            for m in studied_vocab[vocab_review_count:vocab_review_count+remaining_vocab]:
                selected_vocab.append({
                    "material": m,
                    "material_id": m.material_id,
                    "lesson_id": lesson_id,
                    **material_priorities[m.material_id]
                })
        
        selected_grammar = []
        
        grammar_review_count = min(int(grammar_target * 0.7), len(studied_grammar))
        for m in studied_grammar[:grammar_review_count]:
            selected_grammar.append({
                "material": m,
                "material_id": m.material_id,
                "lesson_id": lesson_id,
                **material_priorities[m.material_id]
            })
        
        grammar_new_count = min(grammar_target - len(selected_grammar), len(new_grammar))
        for m in random.sample(new_grammar, grammar_new_count) if grammar_new_count > 0 and new_grammar else []:
            selected_grammar.append({
                "material": m,
                "material_id": m.material_id,
                "lesson_id": lesson_id
            })
        
        remaining_grammar = grammar_target - len(selected_grammar)
        if remaining_grammar > 0 and len(studied_grammar) > grammar_review_count:
            for m in studied_grammar[grammar_review_count:grammar_review_count+remaining_grammar]:
                selected_grammar.append({
                    "material": m,
                    "material_id": m.material_id,
                    "lesson_id": lesson_id,
                    **material_priorities[m.material_id]
                })
        
        quiz_materials = selected_vocab + selected_grammar
        random.shuffle(quiz_materials)
        
        return quiz_materials
    
    @staticmethod
    def get_lesson_progress(db: Session, user_id: str, lesson_id: int) -> Dict[str, Any]:
        lesson_materials = db.query(Material).filter(Material.lesson_id == lesson_id).all()
        total_materials = len(lesson_materials)
            
        if total_materials == 0:
            return {
                "lesson_id": lesson_id,
                "total_materials": 0,
                "materials_studied": 0,
                "materials_mastered": 0,
                "percent_complete": 0,
                "percent_mastered": 0,
                "average_understanding": 0
            }
            
        user_materials = db.query(UserMaterialData).filter(
            UserMaterialData.user_id == user_id,
            UserMaterialData.lesson_id == lesson_id
        ).all()
            
        materials_studied = len(user_materials)
            
        if materials_studied == 0:
            return {
                "lesson_id": lesson_id,
                "total_materials": total_materials,
                "materials_studied": 0,
                "materials_mastered": 0,
                "percent_complete": 0,
                "percent_mastered": 0,
                "average_understanding": 0
            }
            
        today = datetime.now().date()
        current_levels = []
            
        for um in user_materials:
            days_since_review = (today - um.date_last_seen).days
            current_level = SpacedRepetitionService.apply_forgetting_curve(
                um.level_of_understanding, 
                days_since_review
            )
            current_levels.append(current_level)
            
        materials_mastered = sum(1 for level in current_levels 
                                if level >= SpacedRepetitionService.MASTERY_THRESHOLD)
            
        percent_complete = (materials_studied / total_materials) * 100
        percent_mastered = (materials_mastered / total_materials) * 100
        average_understanding = sum(current_levels) / len(current_levels) if current_levels else 0
            
        return {
            "lesson_id": lesson_id,
            "total_materials": total_materials,
            "materials_studied": materials_studied,
            "materials_mastered": materials_mastered,
            "percent_complete": round(percent_complete, 1),
            "percent_mastered": round(percent_mastered, 1),
            "average_understanding": round(average_understanding, 2)
        }
    
    @staticmethod
    def update_material_understanding(db: Session, user_id: str, material_id: int, lesson_id: int, was_correct: bool, difficulty_rating: str = "GOOD") -> UserMaterialData:
        user_material = db.query(UserMaterialData).filter(
            UserMaterialData.user_id == user_id,
            UserMaterialData.material_id == material_id,
            UserMaterialData.lesson_id == lesson_id
        ).first()
            
        today = datetime.now().date()
        now = datetime.now().time()
            
        if user_material:
            new_day = today > user_material.date_last_seen
                
            current_level = user_material.level_of_understanding
                
            # Determine adjustment factor based on difficulty rating
            if was_correct:
                if difficulty_rating == "EASY":
                    # Larger increase for easy items
                    adjustment = 0.15
                elif difficulty_rating == "GOOD":
                    # Moderate increase for good items
                    adjustment = 0.1
                elif difficulty_rating == "HARD":
                    # Small increase for hard items
                    adjustment = 0.05
                else:
                    # Default increase
                    adjustment = 0.1
            else:
                # Decrease for incorrect answers
                adjustment = -0.2
                
            if not new_day:
                daily_increase = max(0, current_level - user_material.level_of_understanding)
                    
                if daily_increase >= SpacedRepetitionService.MAX_DAILY_UNDERSTANDING_INCREASE and adjustment > 0:
                    adjustment = 0
                
            new_level = min(1.0, max(0.0, current_level + adjustment))
                
            user_material.level_of_understanding = new_level
            user_material.date_last_seen = today
            user_material.time_last_seen = now
            user_material.times_studied += 1
        else:
            initial_level = 0.5 if was_correct else 0.3
                
            user_material = UserMaterialData(
                user_id=user_id,
                lesson_id=lesson_id,
                material_id=material_id,
                date_last_seen=today,
                time_last_seen=now,
                times_studied=1,
                level_of_understanding=initial_level
            )
            db.add(user_material)
            
        db.commit()
        db.refresh(user_material)
            
        return user_material
    
    @staticmethod
    def get_quiz_session_for_lesson(db: Session, user_id: str, lesson_id: int, quiz_size: int = 10) -> List[Dict[str, Any]]:
        materials = SpacedRepetitionService.get_quiz_session(db, user_id, lesson_id, quiz_size)
            
        quiz_questions = []
        for item in materials:
            material = item["material"]
                
            question = {
                "material_id": material.material_id,
                "lesson_id": material.lesson_id,
                "type": material.type_of_material
            }
                
            if material.type_of_material == "vocabulary":
                question.update({
                    "word": material.vocabulary_word,
                    "answer": material.vocabulary_definition,
                    "prompt": f"What is the meaning of: {material.vocabulary_word}?"
                })
            elif material.type_of_material == "grammar":
                if material.grammar_structure_answer and "(" in material.grammar_structure_answer:
                    answer_match = re.search(r'\(([^)]+)\)', material.grammar_structure_answer)
                    answer = answer_match.group(1) if answer_match else material.grammar_structure_answer
                    
                    full_text = re.sub(r'[\(\)]', '', material.grammar_structure_answer)
                    
                    prompt = full_text.replace(answer, "___")
                else:
                    answer = material.grammar_structure_answer
                    prompt = material.grammar_structure_practice
                
                question.update({
                    "prompt": prompt,
                    "answer": answer,
                    "grammar_type": getattr(material, "grammar_type", None)
                })
                
            if "estimated_current_understanding" in item:
                question["current_understanding"] = item["estimated_current_understanding"]
                
            quiz_questions.append(question)
                
        return quiz_questions
    
    @staticmethod
    def get_lesson_progress_stats(db: Session, user_id: str, lesson_id: int) -> Dict[str, Any]:
        return SpacedRepetitionService.get_lesson_progress(db, user_id, lesson_id)