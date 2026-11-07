#!/usr/bin/env bash
# Build Trackey.app, install to /Applications, reset to a clean DB.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UI="$ROOT/ui"
APP_SRC="$UI/src-tauri/target/release/bundle/macos/Trackey.app"
APP_DST="/Applications/Trackey.app"

cd "$ROOT"

echo "==> Ensuring Python env + clean database"
uv sync
rm -f data/trackey.db data/trackey.db-journal data/trackey.db-wal data/trackey.db-shm
uv run alembic upgrade head

echo "==> Building Trackey desktop app"
cd "$UI"
npm install
npm run desktop:build

if [[ ! -d "$APP_SRC" ]]; then
  echo "Build failed: missing $APP_SRC" >&2
  exit 1
fi

echo "==> Installing to $APP_DST"
rm -rf "$APP_DST"
cp -R "$APP_SRC" "$APP_DST"
xattr -cr "$APP_DST" || true

echo "==> Done"
echo "Open Trackey from Spotlight or: open -a Trackey"
echo "Database: $ROOT/data/trackey.db (empty schema, ready for your spends)"
