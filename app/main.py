from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    analytics_router,
    health_router,
    spend_categories_router,
    spends_router,
)

app = FastAPI(title="Trackey", version="0.1.0")
# Local-only API: allow browser Vite + Tauri webview origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "tauri://localhost",
        "https://tauri.localhost",
        "http://tauri.localhost",
        "asset://localhost",
        "https://asset.localhost",
        "http://asset.localhost",
    ],
    allow_origin_regex=r"^(https?://(localhost|127\.0\.0\.1|tauri\.localhost|asset\.localhost)(:\d+)?|tauri://localhost|asset://localhost)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(spend_categories_router)
app.include_router(spends_router)
app.include_router(analytics_router)
