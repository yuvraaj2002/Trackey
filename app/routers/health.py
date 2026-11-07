from datetime import datetime, timezone

from fastapi import APIRouter, Response, status

from app.db.session import check_db_connection

router = APIRouter(tags=["health"])

STARTED_AT = datetime.now(timezone.utc)


@router.get("/health")
def health() -> dict:
    now = datetime.now(timezone.utc)
    return {
        "status": "ok",
        "service": "trackey",
        "started_at": STARTED_AT.isoformat(),
        "timestamp": now.isoformat(),
        "uptime_seconds": (now - STARTED_AT).total_seconds(),
    }


@router.get("/health/db")
def health_db(response: Response) -> dict:
    try:
        check_db_connection()
        return {"status": "ok", "database": "healthy"}
    except Exception as exc:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "error",
            "database": "unhealthy",
            "detail": str(exc),
        }
