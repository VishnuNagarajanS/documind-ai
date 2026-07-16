from typing import Any, Optional
from fastapi import HTTPException, status


def success_response(data: Any = None, message: str = "Success") -> dict:
    """Wrap successful response in standard envelope"""
    return {
        "success": True,
        "data": data if data is not None else {},
        "message": message
    }


def error_response(error: str, detail: Optional[str] = None, status_code: int = status.HTTP_400_BAD_REQUEST) -> HTTPException:
    """Create error response with standard envelope"""
    raise HTTPException(
        status_code=status_code,
        detail={
            "success": False,
            "error": error,
            "detail": detail or error
        }
    )
