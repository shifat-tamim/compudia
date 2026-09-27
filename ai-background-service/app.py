from __future__ import annotations

import io
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError
from rembg import new_session, remove


MAX_IMAGE_BYTES = int(os.getenv("MAX_IMAGE_BYTES", str(20 * 1024 * 1024)))
MODEL_NAME = os.getenv("REMBG_MODEL", "u2net")
ALPHA_MATTING = os.getenv("REMBG_ALPHA_MATTING", "false").lower() in {"1", "true", "yes", "on"}
ALPHA_MATTING_FOREGROUND_THRESHOLD = int(os.getenv("REMBG_ALPHA_MATTING_FOREGROUND_THRESHOLD", "240"))
ALPHA_MATTING_BACKGROUND_THRESHOLD = int(os.getenv("REMBG_ALPHA_MATTING_BACKGROUND_THRESHOLD", "10"))
ALPHA_MATTING_ERODE_SIZE = int(os.getenv("REMBG_ALPHA_MATTING_ERODE_SIZE", "10"))

app = FastAPI(title="Compudia Background AI", version="0.1.0")
session = new_session(MODEL_NAME)


@app.get("/health")
def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "engine": "rembg",
        "model": MODEL_NAME,
        "alpha_matting": ALPHA_MATTING,
    }


@app.post("/remove-background")
async def remove_background(image: UploadFile = File(...)) -> Response:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Unsupported image type")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=422, detail="Image file is empty")

    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image file is too large")

    try:
        with Image.open(io.BytesIO(image_bytes)) as opened:
            opened.verify()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=422, detail="Invalid image file")

    try:
        output = remove(
            image_bytes,
            session=session,
            alpha_matting=ALPHA_MATTING,
            alpha_matting_foreground_threshold=ALPHA_MATTING_FOREGROUND_THRESHOLD,
            alpha_matting_background_threshold=ALPHA_MATTING_BACKGROUND_THRESHOLD,
            alpha_matting_erode_size=ALPHA_MATTING_ERODE_SIZE,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Background removal failed") from exc

    return Response(
        content=output,
        media_type="image/png",
        headers={"Cache-Control": "no-store"},
    )
