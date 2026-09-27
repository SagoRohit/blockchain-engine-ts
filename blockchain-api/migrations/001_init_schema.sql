-- Core schema for the blockchain explorer.
-- Postgres is the source of truth for wallets/blocks/transactions; the
-- blockchain-engine package only supplies hashing/signing/PoW helpers.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      TEXT NOT NULL UNIQUE,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallets (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address                 TEXT NOT NULL UNIQUE,
    encrypted_private_key   TEXT NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

CREATE TABLE blocks (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    index              INTEGER NOT NULL UNIQUE,
    previous_hash      TEXT NOT NULL,
    hash               TEXT NOT NULL UNIQUE,
    nonce              BIGINT NOT NULL,
    difficulty         INTEGER NOT NULL,
    miner_address      TEXT NOT NULL,
    transaction_count  INTEGER NOT NULL DEFAULT 0,
    total_volume       NUMERIC NOT NULL DEFAULT 0,
    mined_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tx_hash       TEXT NOT NULL UNIQUE,
    from_address  TEXT NULL,
    to_address    TEXT NOT NULL,
    amount        NUMERIC NOT NULL CHECK (amount > 0),
    signature     TEXT NULL,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
    block_id      UUID NULL REFERENCES blocks(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    confirmed_at  TIMESTAMPTZ NULL
);

CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_block_id ON transactions(block_id);

-- "Follow another researcher" analog: a user watches an address.
CREATE TABLE watchlist (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    watched_address TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, watched_address)
);

-- Shadow table: sensitive/large transfers are logged here by a trigger,
-- independent of the main transactions table.
CREATE TABLE transaction_audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID NOT NULL,
    from_address    TEXT NULL,
    to_address      TEXT NOT NULL,
    amount          NUMERIC NOT NULL,
    flagged_reason  TEXT NOT NULL,
    logged_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
