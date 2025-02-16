from fastapi import FastAPI
from app.routers import user
from app.db.models import User
from app.db.database import get_db_connection
from app.auth import verify_firebase_token

app = FastAPI()

@app.get("/")
def home():
    return {"message": "We are running"}

@app.post("/login")
async def login(token: str):
    # Verify the Firebase ID token and get user data
    firebase_uid, email = verify_firebase_token(token)

    # user check and creation for database 
    # conn = get_db_connection()
    # cursor = conn.cursor()
    # cursor.execute("SELECT * FROM users WHERE firebase_uid = %s", (firebase_uid,))
    # user = cursor.fetchone()
    # if not user:
    #     cursor.execute(
    #         "INSERT INTO users (firebase_uid, email) VALUES (%s, %s)",
    #         (firebase_uid, email),
    #     )
    #     conn.commit()

    return {"message": "User logged in successfully", "firebase_uid": firebase_uid, "email": email}

app.include_router(user.router, prefix="/api", tags=["User"])