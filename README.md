# Trackey

Basic FastAPI app backed by a local SQLite database via SQLAlchemy ORM.

## Stack

- Python 3.12
- FastAPI + Uvicorn
- SQLAlchemy 2.x
- Alembic
- SQLite (`data/trackey.db`)

## Setup

```bash
uv sync
uv add alembic   # if not already present
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | App/server health |
| GET | `/health/db` | Database connectivity check |
| GET | `/spend-categories` | List active spend categories |
| POST | `/spend-categories` | Create a category (`{"name": "..."}`) |
| DELETE | `/spend-categories/{id}` | Soft-delete a category |

Soft delete sets `status` to `deleted` instead of removing the row.
