from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from .database import get_db
from .errors import (
    raise_validation_error, raise_unauthorized_error, raise_forbidden_error,
    raise_conflict_error, raise_service_unavailable_error
)
from .models import User
from .auth_schemas import SignUpRequest, LoginRequest, TokenResponse, UserResponse, ResendVerificationRequest
from .auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
    generate_verification_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from .email_service import send_verification_email
from datetime import timedelta, datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise_unauthorized_error("Your session has expired. Please log in again.")
    
    email: str = payload.get("sub")
    if email is None:
        raise_unauthorized_error("Invalid authentication token. Please log in again.")
    
    try:
        user = db.query(User).filter(User.email == email).first()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to verify your account due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    if user is None:
        raise_unauthorized_error("Your account could not be found. Please log in again.")
    
    return user


@router.post("/signup")
async def signup(user_data: SignUpRequest, db: Session = Depends(get_db)):
    if not user_data.email or not user_data.email.strip():
        raise_validation_error("Email address is required", field="email")
    
    if "@" not in user_data.email or "." not in user_data.email.split("@")[1]:
        raise_validation_error("Please enter a valid email address", field="email")
    
    if not user_data.password or len(user_data.password) < 8:
        raise_validation_error(
            "Password must be at least 8 characters long",
            field="password",
            details={"min_length": 8}
        )
    
    if len(user_data.password) > 128:
        raise_validation_error(
            "Password cannot exceed 128 characters",
            field="password",
            details={"max_length": 128}
        )
    
    try:
        existing_user = db.query(User).filter(User.email == user_data.email.lower().strip()).first()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to create account due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    if existing_user:
        raise_conflict_error(
            "An account with this email address already exists. Please log in or use a different email.",
            resource="user"
        )
    
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email.lower().strip(),
        hashed_password=hashed_password,
        full_name=user_data.full_name.strip() if user_data.full_name else None,
        is_active=True,
        email_verified=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to create account due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    return {"message": "Account created successfully. You can now log in."}


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    if not form_data.username or not form_data.username.strip():
        raise_validation_error("Email address is required", field="username")
    
    if not form_data.password:
        raise_validation_error("Password is required", field="password")
    
    try:
        user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    except OperationalError as e:
        db.rollback()
        raise_service_unavailable_error(
            "Unable to log in due to a database connection issue. Please try again in a moment.",
            service="database"
        )
    
    if not user:
        raise_unauthorized_error("Incorrect email or password. Please check your credentials and try again.")
    
    if not verify_password(form_data.password, user.hashed_password):
        raise_unauthorized_error("Incorrect email or password. Please check your credentials and try again.")
    
    if not user.is_active:
        raise_forbidden_error(
            "Your account has been deactivated. Please contact support for assistance.",
            reason="account_inactive"
        )
    
    # EMAIL VERIFICATION CHECK TEMPORARILY DISABLED FOR TESTING
    # if not user.email_verified:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Email not verified. Please check your email and verify your account before logging in."
    #     )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    from .auth import decode_access_token
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token"
        )
    
    email = payload.get("email")
    hashed_password = payload.get("hashed_password")
    full_name = payload.get("full_name")
    
    if not email or not hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        if existing_user.email_verified:
            return {"message": "Email already verified. You can login now."}
        else:
            existing_user.email_verified = True
            existing_user.is_active = True
            db.commit()
            return {"message": "Email verified successfully. Your account has been activated."}
    
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        is_active=True,
        email_verified=True
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"message": "Email verified successfully. Your account has been created."}


@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        if user.email_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already verified. You can login."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account already exists but is unverified. Please contact support or sign up with a different email."
        )
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No pending signup found for this email. Please sign up again to receive a new verification email."
    )

