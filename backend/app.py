from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

import config

import gradio as gr
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


# Create the Gradio interface
with gr.Blocks(title="ResearchCompass API") as demo:
    gr.Markdown("# 🧭 ResearchCompass API Server")
    gr.Markdown("The backend server is running and ready to analyze papers.")
    gr.Markdown("Send your API requests to `/api/v1/analyze`.")
    
    # Hidden components to satisfy Hugging Face ZeroGPU @spaces.GPU detection
    dummy_btn = gr.Button("GPU Trigger", visible=False)
    dummy_btn.click(fn=dummy_gpu_check, inputs=[], outputs=[])

# Configure CORS on Gradio's internal FastAPI app
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=config.settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include custom API router on Gradio's FastAPI app
demo.app.include_router(router, prefix="/api/v1")

# Reference for test clients and uvicorn running
app = demo.app



@demo.app.get("/status")
async def status() -> dict[str, str]:
    return {"status": "ResearchCompass is running", "version": "1.0.0"}


@demo.app.on_event("startup")
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


if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
