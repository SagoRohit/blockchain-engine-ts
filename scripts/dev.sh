#!/usr/bin/env bash
# Brings up the whole stack: Postgres (docker), migrations, the NestJS
# backend, and the Next.js frontend. Ctrl+C stops the backend/frontend;
# Postgres keeps running (docker compose down to stop it).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Starting Postgres (docker compose)..."
docker compose up -d --wait

echo "==> Installing dependencies (blockchain-engine + blockchain-api)..."
pnpm install

echo "==> Building blockchain-engine..."
pnpm --filter blockchain-engine build

cd "$ROOT_DIR/blockchain-api"
if [ ! -f .env ]; then
    echo "==> Creating blockchain-api/.env from .env.example"
    cp .env.example .env
fi

echo "==> Running database migrations..."
pnpm run migrate

echo "==> Starting backend (blockchain-api) on :3000..."
# setsid makes this its own process group leader, so on cleanup we can
# kill the whole group (pnpm -> nest/next spawn children that a plain
# `kill $PID` would otherwise leave running as orphans).
setsid pnpm run start:dev > "$ROOT_DIR/blockchain-api.log" 2>&1 &
API_PID=$!

cd "$ROOT_DIR/blockchain-explorer-frontend"
if [ ! -f .env.local ]; then
    echo "==> Creating blockchain-explorer-frontend/.env.local from env.example"
    cp env.example .env.local
fi

echo "==> Installing frontend dependencies..."
pnpm install

echo "==> Starting frontend on :3001..."
setsid pnpm run dev > "$ROOT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "==> Stopping backend and frontend..."
    kill -- -"$API_PID" -"$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

cat <<MSG

--------------------------------------------------------------
 Backend:  http://localhost:3000  (Swagger docs at /api)
 Frontend: http://localhost:3001
 Logs:     blockchain-api.log, frontend.log
 Postgres: still running after Ctrl+C — 'docker compose down' to stop it
--------------------------------------------------------------

Press Ctrl+C to stop the backend and frontend.
MSG

wait "$API_PID" "$FRONTEND_PID"
