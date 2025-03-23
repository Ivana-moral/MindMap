import firebase_admin
import os
from firebase_admin import credentials, auth
from fastapi import HTTPException
import json
import jwt
import time
import os

firebase_key_path = os.getenv('FIREBASE_PRIVATE_KEY_PATH')

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_key_path)
firebase_admin.initialize_app(cred)

# Function to verify the Firebase ID token
def verify_firebase_token(token: str):
    """Verify Firebase ID token or test token"""
    print(f"Verifying token: {token[:10]}...")
    # Skip verification in development mode if the token is from our test endpoint
    if os.getenv("ENVIRONMENT") == "development":
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            print(f"Decoded payload: {payload}")
            
            if "test_token" in payload and payload.get("test_token") is True:
                print("Using test token")
                return payload["uid"], payload.get("email", "")
        except Exception as e:
            print(f"Error decoding token: {e}")

    try:
        # Verify the Google ID token with Firebase
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token["uid"]
        email = decoded_token["email"]
        return firebase_uid, email
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid token: {str(e)}")


def create_test_id_token(user_id: str, email: str):
    """
    Create a test Firebase ID token for development purposes.
    This is not a real Firebase token but follows the same format.
    """
    if os.getenv("ENVIRONMENT") != "development":
        raise Exception("Test tokens can only be generated in development environment")
    
    # Get Firebase project ID from the credentials file
    with open(os.getenv('FIREBASE_PRIVATE_KEY_PATH'), 'r') as f:
        cred_data = json.load(f)
        project_id = cred_data.get('project_id')
    
    now = int(time.time())
    payload = {
        "iss": f"https://securetoken.google.com/{project_id}",
        "aud": project_id,
        "iat": now,
        "exp": now + 3600,  # 1 hour expiration
        "auth_time": now,
        "sub": user_id,
        "uid": user_id,
        "email": email,
        "email_verified": True
    }
    

    secret = "test-secret-key-for-development-only"
    token = jwt.encode(payload, secret, algorithm="HS256")
    
    return token