from sqlalchemy import Column, Integer, String, Float, Boolean, Date, Time, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(String(255), primary_key=True)  #Firebase UID
    username = Column(String(255), unique=True)
    email = Column(String(255), unique=True)
    date_created = Column(Date, default=datetime.utcnow)
    last_login = Column(Date)
    role = Column(String(50))
    
    # Relationships
    lesson_logs = relationship("LessonLog", back_populates="user")
    material_data = relationship("UserMaterialData", back_populates="user")
    inscribed_classes = relationship("InscribedStudents", back_populates="user")


class Class(Base):
    __tablename__ = 'classes'
    
    class_id = Column(Integer, primary_key=True, autoincrement=True)
    class_name = Column(String(255))
    
    # Relationships
    lessons = relationship("Lesson", back_populates="class_")
    students = relationship("InscribedStudents", back_populates="class_")


class InscribedStudents(Base):
    __tablename__ = 'inscribed_students'
    
    user_id = Column(String(255), ForeignKey('users.user_id'), primary_key=True)
    class_id = Column(Integer, ForeignKey('classes.class_id'), primary_key=True)
    
    # Relationships
    user = relationship("User", back_populates="inscribed_classes")
    class_ = relationship("Class", back_populates="students")


class Lesson(Base):
    __tablename__ = 'lessons'
    
    lesson_id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_name = Column(String(255))
    lesson_number = Column(Float)
    class_id = Column(Integer, ForeignKey('classes.class_id'))
    
    # Relationships
    class_ = relationship("Class", back_populates="lessons")
    materials = relationship("Material", back_populates="lesson")
    lesson_logs = relationship("LessonLog", back_populates="lesson")
    user_material_data = relationship("UserMaterialData", back_populates="lesson")


class Material(Base):
    __tablename__ = 'materials'
    
    material_id = Column(Integer, primary_key=True, autoincrement=True)
    lesson_id = Column(Integer, ForeignKey('lessons.lesson_id'))
    type_of_material = Column(String(50))
    vocabulary_word = Column(String(255), nullable=True)
    vocabulary_definition = Column(String(1000), nullable=True)
    grammar_structure_practice = Column(String(1000), nullable=True)
    grammar_structure_answer = Column(String(1000), nullable=True)
    
    # Relationships
    lesson = relationship("Lesson", back_populates="materials")
    user_material_data = relationship("UserMaterialData", back_populates="material")


class UserMaterialData(Base):
    __tablename__ = 'user_material_data'
    
    user_id = Column(String(255), ForeignKey('users.user_id'), primary_key=True)
    lesson_id = Column(Integer, ForeignKey('lessons.lesson_id'), primary_key=True)
    material_id = Column(Integer, ForeignKey('materials.material_id'), primary_key=True)
    date_last_seen = Column(Date)
    time_last_seen = Column(Time)
    times_studied = Column(Integer, default=0)
    level_of_understanding = Column(Float, default=0.0)
    
    # Relationships
    user = relationship("User", back_populates="material_data")
    lesson = relationship("Lesson", back_populates="user_material_data")
    material = relationship("Material", back_populates="user_material_data")


class LessonLog(Base):
    __tablename__ = 'lesson_logs'
    
    attempt_id = Column(String(255), primary_key=True)
    user_id = Column(String(255), ForeignKey('users.user_id'))
    lesson_id = Column(Integer, ForeignKey('lessons.lesson_id'))
    attempt_date = Column(Date)
    was_correct = Column(Boolean)
    time_taken = Column(Float)
    
    # Relationships
    user = relationship("User", back_populates="lesson_logs")
    lesson = relationship("Lesson", back_populates="lesson_logs")