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


# Initialize clean FastAPI sub-application for custom API endpoints
api_app = FastAPI(title="ResearchCompass API")

# Configure CORS on our custom API app
api_app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include custom API router on our API sub-app
api_app.include_router(router)


@api_app.get("/status")
async def status() -> dict[str, str]:
    return {"status": "ResearchCompass is running", "version": "1.0.0"}


@api_app.on_event("startup")
async def startup_event():
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


# Create the Gradio interface
with gr.Blocks(title="ResearchCompass API") as demo:
    gr.Markdown("# 🧭 ResearchCompass API Server")
    gr.Markdown("The backend server is running and ready to analyze papers.")
    gr.Markdown("Send your API requests to `/v1/analyze`.")
    
    # Hidden components to satisfy Hugging Face ZeroGPU @spaces.GPU detection
    dummy_btn = gr.Button("GPU Trigger", visible=False)
    dummy_btn.click(fn=dummy_gpu_check, inputs=[], outputs=[])

# Mount our custom API app onto Gradio's internal FastAPI app at /api/v1 path
demo.app.mount("/api/v1", api_app)

# Force our custom API mount to the front of FastAPI's routing table so it takes precedence over Gradio/SvelteKit
for i, r in enumerate(demo.app.router.routes):
    if hasattr(r, "path") and r.path == "/api/v1":
        route = demo.app.router.routes.pop(i)
        demo.app.router.routes.insert(0, route)
        break

# Export the app for test clients
app = demo.app


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
