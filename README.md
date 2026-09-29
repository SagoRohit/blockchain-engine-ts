# Blockchain Engine TS

A learning project: a hand-built blockchain (PoW, wallets, signed transactions)
persisted to PostgreSQL, exposed through a NestJS API, and explored through a
Next.js frontend.

## Structure

| Package | What it is |
|---|---|
| `blockchain-engine/` | The blockchain itself — blocks, transactions, wallets, hashing (SHA-256), signing (secp256k1), proof-of-work. Pure TypeScript, unit tested, no I/O. |
| `blockchain-api/` | NestJS backend. Persists everything to Postgres: JWT auth, wallets, transactions, mining, watchlist, and analytics endpoints. Uses the raw `pg` driver (no ORM) — see `blockchain-api/migrations/` for the schema, functions, triggers, and the `mine_block` procedure. |
| `blockchain-explorer-frontend/` | Next.js UI: register/login, wallet + send transaction, mine pending transactions, block/transaction explorer, analytics, watchlist. |

`blockchain-api` and `blockchain-explorer-frontend` are **separate pnpm
workspaces** (each has its own `pnpm-lock.yaml`) — install dependencies in
each of them independently.

## Prerequisites

- Node.js 18+ and [pnpm](https://pnpm.io)
- [Docker](https://docs.docker.com/get-docker/) (for Postgres) — or your own
  local Postgres 16 instance

## Quick start (one command)

```bash
pnpm run dev
```

This runs [`scripts/dev.sh`](scripts/dev.sh), which:
1. Starts Postgres via `docker compose` and waits for it to be healthy
2. Installs dependencies and builds `blockchain-engine`
3. Copies `.env.example` → `.env` / `.env.local` if they don't exist yet
4. Runs the database migrations
5. Starts the backend (`:3000`) and frontend (`:3001`)

Ctrl+C stops the backend and frontend. Postgres is left running — stop it
with `docker compose down` when you're done.

Open http://localhost:3001. Swagger API docs are at http://localhost:3000/api.

## Manual setup

If you'd rather run each step yourself (or don't have Docker):

```bash
# 1. Database
docker compose up -d --wait          # or point DATABASE_URL at your own Postgres

# 2. Engine + backend
pnpm install                         # installs blockchain-engine + blockchain-api
pnpm --filter blockchain-engine build

cd blockchain-api
cp .env.example .env                 # adjust JWT_SECRET / WALLET_ENCRYPTION_KEY for real use
pnpm run migrate                     # applies migrations/*.sql (idempotent)
pnpm run start:dev                   # http://localhost:3000

# 3. Frontend (separate terminal)
cd blockchain-explorer-frontend
cp env.example .env.local
pnpm install
pnpm run dev                         # http://localhost:3001
```

## Environment variables

`blockchain-api/.env` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Auth token signing |
| `WALLET_ENCRYPTION_KEY` | Passphrase used to encrypt wallet private keys at rest |
| `PORT` | API port (default 3000) |
| `FRONTEND_URL` | Allowed CORS origin (default `http://localhost:3001`) |

`blockchain-explorer-frontend/.env.local` (see `env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | Where the frontend calls the backend (default `http://localhost:3000`) |

## Database features

The database layer (`blockchain-api/migrations/`) implements, in order:
schema (`001`), functions — `get_wallet_balance`, `get_network_stats` (`002`),
triggers — balance validation, block-stat aggregation, large-transfer audit
log (`003`), and the `mine_block` procedure (`004`). Every write goes through
explicit `BEGIN`/`COMMIT`/`ROLLBACK` (`DatabaseService.withTransaction`).

ER diagram (crow's-foot notation): [`docs/database/er-diagram.pdf`](docs/database/er-diagram.pdf)
— generated from [`docs/database/er-diagram.dot`](docs/database/er-diagram.dot) via
`dot -Tpdf er-diagram.dot -o er-diagram.pdf` (Graphviz). Solid lines are real
`REFERENCES` foreign keys; dashed lines are wallet-address `TEXT` columns
that are validated by application code (or the balance trigger) rather than
a declared FK — e.g. `to_address` may legitimately point at an address with
no registered wallet.

## Testing

```bash
pnpm --filter blockchain-engine test
cd blockchain-api && pnpm test
cd blockchain-explorer-frontend && pnpm run lint && pnpm run build
```
