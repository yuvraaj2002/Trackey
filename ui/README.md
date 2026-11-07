# Trackey UI

React + Vite frontend for Trackey. Design tokens and rules live in [`../design.md`](../design.md).

## Develop

```bash
# terminal 1 — API
cd .. && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# terminal 2 — UI
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. API base URL defaults to `http://127.0.0.1:8000` (`VITE_API_BASE_URL`).

## Screens

- **Spends** — list / filter / create / update / hard delete
- **Categories** — list / create / soft delete
- **Analytics** — period summary, category breakdown, top spends
