import firebase_admin
import os
from firebase_admin import credentials, auth
from fastapi import HTTPException

firebase_key_path = os.getenv('FIREBASE_PRIVATE_KEY_PATH')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred)

# Function to verify the Firebase ID token
def verify_firebase_token(token: str):
    try:
        # Verify the Google ID token with Firebase
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token["email"]
        return firebase_uid, email
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")