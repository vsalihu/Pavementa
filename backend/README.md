# Pavementa Backend

The Pavementa backend is the API foundation for the road infrastructure intelligence platform. It will eventually support image ingestion, AI detection workflows, damage registries, GIS data, case management, reporting, authentication, and analytics.

This stage only provides the production-oriented FastAPI foundation:

- FastAPI application entrypoint
- Centralised settings with Pydantic Settings
- Environment variable loading from `.env`
- Python logging configuration
- CORS support for the local frontend
- Root service metadata endpoint
- Health check endpoint
- Road image upload endpoint
- Static serving for uploaded images
- Prototype YOLO detection endpoint
- Original and annotated detection image storage

Database access, authentication, custom road-damage model training, and map features are intentionally deferred to later development stages.

## Requirements

- Python 3.12
- pip
- Virtual environment support

## Setup

From the `backend` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Review `.env` and update values as real services are introduced. Application-specific runtime flags use the `APP_` prefix where appropriate to avoid collisions with generic machine-level environment variables.

## Database Setup

Pavementa uses PostgreSQL with SQLAlchemy and Alembic.

Create a local PostgreSQL database named `pavementa`, then confirm `.env` contains a connection string like:

```text
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/pavementa
```

Run migrations from the `backend` directory:

```powershell
alembic upgrade head
```

To create future migrations after model changes:

```powershell
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Run

From the `backend` directory:

```powershell
uvicorn app.main:app --reload
```

The API will be available at:

- API root: `http://localhost:8000/`
- Health check: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`
- OpenAPI schema: `http://localhost:8000/openapi.json`

## Current Endpoints

`GET /`

```json
{
  "name": "Pavementa API",
  "status": "online",
  "version": "1.0.0"
}
```

`GET /health`

```json
{
  "status": "healthy"
}
```

`POST /api/uploads/image`

Accepts one multipart form field named `file`. Supported image formats are JPG, JPEG, PNG, and WEBP, with a maximum size of 10MB. Uploaded files are stored in `uploads/images/` and served from `/uploads/images/{filename}`.

`POST /api/detections/analyse-image`

Accepts one multipart form field named `file`. The image is stored in `uploads/detections/original/`, analysed with a lightweight pretrained YOLO model, and an annotated image is stored in `uploads/detections/annotated/`.

This is prototype detection mode: it uses a general pretrained model before road-damage fine-tuning. The response includes `analysis_mode` and `model_name` so the frontend can clearly label the result. It is intended to prove the architecture and UI workflow, not to provide production pothole or crack detection.

`POST /api/reports`

Persists a detection analysis response as a road damage report. Optional title, location name, latitude, and longitude can be included.

`GET /api/reports`

Returns saved reports in newest-first order.

`GET /api/reports/{public_id}`

Returns one saved report with its detections.
