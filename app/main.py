from fastapi import FastAPI

from app.routers import (
    analytics_router,
    health_router,
    spend_categories_router,
    spends_router,
)

app = FastAPI(title="Trackey", version="0.1.0")
app.include_router(health_router)
app.include_router(spend_categories_router)
app.include_router(spends_router)
app.include_router(analytics_router)
