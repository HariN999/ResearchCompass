from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

import config

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load embedding model during startup to prevent runtime request timeouts
    try:
        from dependencies import get_embedding_service
        embedding_service = get_embedding_service()
        embedding_service._get_model()
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").error(
            "Failed to pre-load embedding model during startup: %s", str(e)
        )
    yield


app = FastAPI(title="ResearchCompass API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"status": "ResearchCompass is running", "version": "1.0.0"}
