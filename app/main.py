from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    analytics_router,
    health_router,
    spend_categories_router,
    spends_router,
)

app = FastAPI(title="Trackey", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(spend_categories_router)
app.include_router(spends_router)
app.include_router(analytics_router)
