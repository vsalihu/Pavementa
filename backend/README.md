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

Database access, authentication, AI model integration, uploads, and map features are intentionally deferred to later development stages.

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
