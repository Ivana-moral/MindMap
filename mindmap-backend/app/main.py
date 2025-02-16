from fastapi import FastAPI
from app.routers import user

app = FastAPI()

@app.get("/")
def home():
    return {"message": "We are running"}

app.include_router(user.router, prefix="/api", tags=["Users"])