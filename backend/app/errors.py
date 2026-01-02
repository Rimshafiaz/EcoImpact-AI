from fastapi import HTTPException, status
from typing import Optional, Dict, Any

class AppError(Exception):
    def __init__(self, code: str, message: str, details: Optional[Dict[str, Any]] = None, status_code: int = 500):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code
        super().__init__(self.message)

def raise_validation_error(message: str, field: Optional[str] = None, details: Optional[Dict] = None):
    error_detail = {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": message,
            "field": field,
            "details": details or {}
        }
    }
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_detail)

def raise_not_found_error(message: str, resource: Optional[str] = None):
    error_detail = {
        "error": {
            "code": "NOT_FOUND",
            "message": message,
            "resource": resource,
            "details": {}
        }
    }
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error_detail)

def raise_unauthorized_error(message: str = "Authentication required"):
    error_detail = {
        "error": {
            "code": "UNAUTHORIZED",
            "message": message,
            "details": {}
        }
    }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=error_detail,
        headers={"WWW-Authenticate": "Bearer"}
    )

def raise_forbidden_error(message: str, reason: Optional[str] = None):
    error_detail = {
        "error": {
            "code": "FORBIDDEN",
            "message": message,
            "reason": reason,
            "details": {}
        }
    }
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error_detail)

def raise_conflict_error(message: str, resource: Optional[str] = None):
    error_detail = {
        "error": {
            "code": "CONFLICT",
            "message": message,
            "resource": resource,
            "details": {}
        }
    }
    raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_detail)

def raise_service_unavailable_error(message: str, service: Optional[str] = None):
    error_detail = {
        "error": {
            "code": "SERVICE_UNAVAILABLE",
            "message": message,
            "service": service,
            "details": {}
        }
    }
    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=error_detail)

def raise_internal_error(message: str = "An unexpected error occurred. Please try again later."):
    error_detail = {
        "error": {
            "code": "INTERNAL_ERROR",
            "message": message,
            "details": {}
        }
    }
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_detail)

