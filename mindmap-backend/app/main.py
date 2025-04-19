# app/main.py
from fastapi import FastAPI
from app.routers import user, lesson, auth, quiz, classes
from app.db.models import Base
from app.db.database import engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "MindMap API is running"}

# Include routers
app.include_router(auth.router, tags=["Authentication"])
app.include_router(user.router, prefix="/api/users", tags=["Users"])
app.include_router(lesson.router, prefix="/api", tags=["Lessons"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["Quiz"])
app.include_router(classes.router, prefix="/api/classes", tags=["Classes"])