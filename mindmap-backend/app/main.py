# app/main.py
from fastapi import FastAPI
from app.routers import user, lesson, auth
from app.db.models import Base
from app.db.database import engine

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MindMap API is running"}

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])
app.include_router(lesson.router, prefix="/api", tags=["Lessons"])