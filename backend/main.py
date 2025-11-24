import os
import time
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from core.engine import engine

APP_VERSION = "2.0.0"
START_TIME = time.time()


def _load_allowed_origins() -> List[str]:
    env_origins = os.getenv("ALLOWED_ORIGINS")
    if env_origins:
        return [origin.strip() for origin in env_origins.split(",") if origin.strip()]
    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]


app = FastAPI(title="tYp3r v2 API", description="Prompt obfuscation backend", version=APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_load_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "tYp3r v2 Engine Online", "version": APP_VERSION}


@app.get("/health")
async def health_check():
    uptime_seconds = time.time() - START_TIME
    return {
        "status": "healthy",
        "version": APP_VERSION,
        "uptime": uptime_seconds,
        "transform_count": len(engine.registry),
    }
