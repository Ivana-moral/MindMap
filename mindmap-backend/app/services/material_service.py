from sqlalchemy.orm import Session
from app.db.models import Material, UserMaterialData
from typing import List, Optional
from datetime import date, datetime

def get_all_materials(db: Session, lesson_id: Optional[int] = None, type_of_material: Optional[str] = None):
    query = db.query(Material)
    
    if lesson_id:
        query = query.filter(Material.lesson_id == lesson_id)
    
    if type_of_material:
        query = query.filter(Material.type_of_material == type_of_material)
    
    return query.all()

def get_material_by_id(db: Session, material_id: int):
    return db.query(Material).filter(Material.material_id == material_id).first()

def create_vocabulary_material(db: Session, lesson_id: int, word: str, definition: str):
    material = Material(
        lesson_id=lesson_id,
        type_of_material="vocabulary",
        vocabulary_word=word,
        vocabulary_definition=definition
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

def create_grammar_material(db: Session, lesson_id: int, practice: str, answer: str):
    material = Material(
        lesson_id=lesson_id,
        type_of_material="grammar",
        grammar_structure_practice=practice,
        grammar_structure_answer=answer
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material

def update_material(db: Session, material_id: int, material_data: dict):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        return None
    
    for key, value in material_data.items():
        if hasattr(material, key) and key != "material_id":
            setattr(material, key, value)
    
    db.commit()
    db.refresh(material)
    return material

def delete_material(db: Session, material_id: int):
    material = db.query(Material).filter(Material.material_id == material_id).first()
    if not material:
        return False
    
    db.delete(material)
    db.commit()
    return True

def track_material_interaction(db: Session, user_id: str, lesson_id: int, material_id: int, was_correct: bool):
    # Check if there's an existing record
    user_material = db.query(UserMaterialData).filter(
        UserMaterialData.user_id == user_id,
        UserMaterialData.lesson_id == lesson_id,
        UserMaterialData.material_id == material_id
    ).first()
    
    now = datetime.now().time()
    today = date.today()
    
    if user_material:
        # Update existing record
        user_material.date_last_seen = today
        user_material.time_last_seen = now
        user_material.times_studied += 1
        
        # Adjust understanding level by .1 increments depending on correctness
        if was_correct:
            # Increase understanding (capped at 1.0)
            new_level = min(1.0, user_material.level_of_understanding + 0.1)
        else:
            # Decrease understanding (minimum 0.0)
            new_level = max(0.0, user_material.level_of_understanding - 0.1)
        
        user_material.level_of_understanding = new_level
    else:
        # Create new record default understanding to .5 if correct, if wrong goes to .3
        user_material = UserMaterialData(
            user_id=user_id,
            lesson_id=lesson_id,
            material_id=material_id,
            date_last_seen=today,
            time_last_seen=now,
            times_studied=1,
            level_of_understanding=0.5 if was_correct else 0.3
        )
        db.add(user_material)
    
    db.commit()
    return user_material