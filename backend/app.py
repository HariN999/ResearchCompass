from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

import config

import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

try:
    import spaces
except ImportError:
    class MockSpaces:
        @staticmethod
        def GPU(func_or_duration=None, *args, **kwargs):
            if callable(func_or_duration):
                return func_or_duration
            def decorator(func):
                return func
            return decorator
    spaces = MockSpaces()


@spaces.GPU
def dummy_gpu_check():
    pass


def _log_routes(app: FastAPI, owner: str) -> None:
    import logging

    logger = logging.getLogger("uvicorn.error")
    logger.info("========== RESEARCHCOMPASS ROUTES ==========")
    logger.info("owner=%s app_id=%s", owner, hex(id(app)))

    def iter_routes(routes, prefix: str = ""):
        for route in routes:
            path = getattr(route, "path", None)
            route_prefix = getattr(route, "prefix", "")
            nested_routes = getattr(route, "routes", None)
            include_context = getattr(route, "include_context", None)
            original_router = getattr(route, "original_router", None)
            if path is not None:
                yield prefix + path, route
            if original_router is not None and include_context is not None:
                yield from iter_routes(
                    original_router.routes,
                    prefix + getattr(include_context, "prefix", ""),
                )
            if nested_routes is not None and route_prefix:
                yield from iter_routes(nested_routes, prefix + route_prefix)

    for path, route in iter_routes(app.router.routes):
        methods = sorted(getattr(route, "methods", []) or [])
        route_owner = (
            "ResearchCompass FastAPI"
            if path and path.startswith("/api/v1")
            else owner
        )
        logger.info("%s %s owner=%s", ",".join(methods) or "MOUNT", path, route_owner)
    logger.info("=============================================")


@asynccontextmanager
async def lifespan(app: FastAPI):
    dummy_gpu_check()

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

    _log_routes(app, "ResearchCompass parent FastAPI")
    yield


# Create the Gradio interface
with gr.Blocks(title="ResearchCompass API") as demo:
    gr.Markdown("# 🧭 ResearchCompass API Server")
    gr.Markdown("The backend server is running and ready to analyze papers.")
    gr.Markdown("Send your API requests to `/api/v1/analyze`.")
    
    # Hidden components to satisfy Hugging Face ZeroGPU @spaces.GPU detection
    dummy_btn = gr.Button("GPU Trigger", visible=False)
    dummy_btn.click(fn=dummy_gpu_check, inputs=[], outputs=[])


# Keep ResearchCompass API routes on a parent FastAPI app and mount Gradio at
# root. Gradio 5.6.0 recreates demo.app inside Blocks.launch(), and its SSR
# middleware proxies non-Gradio paths before FastAPI route matching.
api_app = FastAPI(lifespan=lifespan)

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_app.include_router(router, prefix="/api/v1")


@api_app.get("/status")
@api_app.get("/api/v1/status")
async def status() -> dict[str, str]:
    return {"status": "ResearchCompass is running", "version": "1.0.0"}


@api_app.get("/api/v1/debug")
async def api_debug() -> dict[str, object]:
    return {
        "status": "ok",
        "server": "ResearchCompass FastAPI",
        "gradio": True,
    }


app = gr.mount_gradio_app(api_app, demo, path="/")



if __name__ == "__main__":
    import os
    import uvicorn

    uvicorn.run(
        app,
        host=os.environ.get("GRADIO_SERVER_NAME", "0.0.0.0"),
        port=int(os.environ.get("GRADIO_SERVER_PORT", "7860")),
    )
