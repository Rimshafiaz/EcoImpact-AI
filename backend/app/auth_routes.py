from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .database import get_db
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
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user


@router.post("/signup")
async def signup(user_data: SignUpRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        
        new_user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            is_active=True,
            email_verified=True
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "Account created successfully. You can now log in."}
        
        # EMAIL VERIFICATION TEMPORARILY DISABLED FOR TESTING
        # from .auth import create_access_token
        # 
        # signup_data = {
        #     "email": user_data.email,
        #     "hashed_password": hashed_password,
        #     "full_name": user_data.full_name
        # }
        # 
        # verification_token = create_access_token(
        #     data=signup_data,
        #     expires_delta=timedelta(hours=24)
        # )
        # 
        # email_sent, error_message = send_verification_email(user_data.email, verification_token, user_data.full_name)
        # 
        # if not email_sent:
        #     raise HTTPException(
        #         status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        #         detail=error_message or "Failed to send verification email. Please try again later."
        #     )
        # 
        # return {"message": "Verification email sent. Please check your email to complete registration."}
    
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error during signup: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during signup. Please try again later."
        )


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
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

