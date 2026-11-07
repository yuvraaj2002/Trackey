from fastapi import FastAPI

from app.routers import health_router, spend_categories_router

app = FastAPI(title="Trackey", version="0.1.0")
app.include_router(health_router)
app.include_router(spend_categories_router)
