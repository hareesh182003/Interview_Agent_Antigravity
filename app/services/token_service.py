from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import os

# Configuration (In production, load from secure .env)
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-interview-key-2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class TokenService:
    def create_admission_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """
        Creates a JWT token that grants admission to the interview.
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "admission"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def verify_token(self, token: str):
        """
        Verifies the JWT token and returns the payload.
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "admission":
                return None
            return payload
        except JWTError:
            return None

token_service = TokenService()
