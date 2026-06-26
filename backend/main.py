"""
main.py — FastAPI server for Urdu Word Segmentation

Endpoints:
  GET  /api/health   → backend health check
  POST /api/segment  → run BiLSTM+CRF segmentation on Urdu text

Run with:
  uvicorn main:app --reload --port 8000
"""

import os
import re
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from model import create_segmenter

# ── Logging ──────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(levelname)-7s │ %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Global segmenter instance ────────────────
segmenter = None


# ── Lifespan: load model at startup ─────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    global segmenter
    model_path = os.environ.get("MODEL_PATH", None)
    logger.info("=" * 50)
    logger.info("🚀 Urdu Text Segmentor — Backend Starting")
    logger.info("=" * 50)

    segmenter = create_segmenter(model_path)
    logger.info("✅ Segmenter ready")

    yield  # app runs here

    logger.info("👋 Backend shutting down")


# ── FastAPI App ──────────────────────────────
app = FastAPI(
    title="Urdu Text Segmentor API",
    description="BiLSTM+CRF word segmentation for Urdu text (BIESX tagging)",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow React dev server ────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # CRA dev server
        "http://localhost:5173",   # Vite dev server (if migrated later)
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ────────────────

class SegmentRequest(BaseModel):
    """POST body for /api/segment"""
    text: str

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Text must not be empty")
        return v.strip()


class SegmentResponse(BaseModel):
    """Response from /api/segment"""
    tokens: list[str]       # individual characters/tokens
    tags: list[str]         # BIESX tag per token
    segments: list[str]     # assembled word segments
    input_length: int       # original text length (for debugging)
    model_type: str         # "placeholder" or "bilstm_crf"


# ── Endpoints ────────────────────────────────

@app.get("/api/health")
async def health_check():
    """Quick health check — frontend uses this to verify backend is running."""
    return {
        "status": "ok",
        "model_loaded": segmenter is not None,
        "model_type": type(segmenter).__name__ if segmenter else None,
    }


@app.post("/api/segment", response_model=SegmentResponse)
async def segment_text(request: SegmentRequest):
    """
    Segment Urdu text using the BiLSTM+CRF model.

    Accepts raw Urdu text and returns:
      - tokens: character-level tokens
      - tags: BIESX tag per token
      - segments: assembled word boundaries
    """
    if segmenter is None:
        raise HTTPException(
            status_code=503,
            detail="Model is not loaded. Please restart the server."
        )

    text = request.text
    logger.info(f"📝 Segmenting {len(text)} chars")

    try:
        tokens, tags, segments = segmenter.predict(text)

        logger.info(f"✅ Result: {len(tokens)} tokens → {len(segments)} segments")

        return SegmentResponse(
            tokens=tokens,
            tags=tags,
            segments=segments,
            input_length=len(text),
            model_type=type(segmenter).__name__,
        )

    except Exception as e:
        logger.error(f"❌ Segmentation failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Segmentation failed: {str(e)}"
        )


# ── Run directly ─────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
