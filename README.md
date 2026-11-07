# Trackey

Personal spend tracker — FastAPI + SQLite backend and a React UI.

## Stack

- Python 3.12 · FastAPI · SQLAlchemy 2 · Alembic · SQLite (`data/trackey.db`)
- React · Vite · TypeScript (`ui/`)

## Setup

```bash
uv sync
uv run alembic upgrade head

# Fill ~6 months of realistic local data (wipe first with --reset)
uv run python scripts/seed_dev.py --reset

# API
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# UI (browser)
cd ui && npm install && npm run dev

# Desktop (Tauri) — starts API + native window
cd ui && npm install && npm run desktop:dev

# Install / refresh the macOS app in /Applications (clean DB)
./scripts/install-desktop.sh
```

- API docs: http://127.0.0.1:8000/docs  
- UI: http://127.0.0.1:5173  
- Desktop app: open **Trackey** from Spotlight / Applications (auto-starts local API)  
- Design system: [`design.md`](design.md)  
- Postman: [`postman/Trackey.postman_collection.json`](postman/Trackey.postman_collection.json)  
- Logo prompt (for Grok / image tools): [`docs/logo-prompt.md`](docs/logo-prompt.md)

### Seed options

```bash
uv run python scripts/seed_dev.py              # append-friendly (creates missing categories)
uv run python scripts/seed_dev.py --reset      # clear categories + spends, then seed
uv run python scripts/seed_dev.py --months 6   # history depth (default 6)
uv run python scripts/seed_dev.py --seed 42    # reproducible RNG
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | App health |
| GET | `/health/db` | Database check |
| GET/POST | `/spend-categories` | List / create |
| DELETE | `/spend-categories/{id}` | Soft-delete |
| GET/POST | `/spends` | List (cursor + `category_id`) / create |
| PUT/DELETE | `/spends/{id}` | Update label/amount / hard-delete |
| GET | `/analytics` | Period summary (`start`, `end`, `top_limit`) |
