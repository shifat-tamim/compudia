# Compudia Background AI Service

This is Compudia's self-hosted background-removal microservice. Laravel sends an uploaded image to this service and receives a transparent PNG.

## Local Docker Run

```bash
docker build -t compudia-background-ai ./ai-background-service
docker run --rm -p 8010:8010 compudia-background-ai
```

## Local Windows Run

Use Python 3.11 or 3.12. Python 3.14 may not work because rembg depends on onnxruntime wheels.

```powershell
cd C:\laragon\www\compudia\ai-background-service
.\start-windows.ps1 -Python "C:\Path\To\Python311\python.exe"
```

Then set Laravel:

```env
BACKGROUND_AI_URL=http://127.0.0.1:8010
BACKGROUND_AI_TIMEOUT=180
```

Run:

```bash
php artisan config:clear
```

## Health Check

Open:

```text
http://127.0.0.1:8010/health
```

Expected:

```json
{"status":"ok","engine":"rembg","model":"u2net","alpha_matting":false}
```

## Notes

- The first request may be slower because rembg has to download/load the model.
- `REMBG_MODEL=u2net` is the default because it is a safer free general model for product images than the previous `isnet-general-use` setup.
- Alpha matting is off by default because aggressive matting can remove white product surfaces. Enable it only after testing your product images:

```env
REMBG_ALPHA_MATTING=true
REMBG_ALPHA_MATTING_FOREGROUND_THRESHOLD=240
REMBG_ALPHA_MATTING_BACKGROUND_THRESHOLD=10
REMBG_ALPHA_MATTING_ERODE_SIZE=10
```

- CPU works, but GPU hosting is recommended for production speed.
- This service does not store uploaded images.
