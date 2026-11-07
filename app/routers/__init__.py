from app.routers.analytics import router as analytics_router
from app.routers.health import router as health_router
from app.routers.spend_categories import router as spend_categories_router
from app.routers.spends import router as spends_router

__all__ = [
    "analytics_router",
    "health_router",
    "spend_categories_router",
    "spends_router",
]
