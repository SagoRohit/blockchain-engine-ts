-- Trigger 1: data validation before DML (BEFORE INSERT).
-- DB-level double-spend guard: rejects a non-reward transaction whose
-- amount exceeds the sender's confirmed balance minus what they already
-- have pending. This is defense-in-depth alongside the app-level check in
-- Transaction.isValid()/Blockchain.addTransaction — it protects the data
-- even if a future code path inserts directly.
CREATE OR REPLACE FUNCTION fn_validate_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_balance NUMERIC;
    v_pending_outgoing NUMERIC;
BEGIN
    IF NEW.from_address IS NOT NULL THEN
        v_balance := get_wallet_balance(NEW.from_address);

        SELECT COALESCE(SUM(amount), 0)
        INTO v_pending_outgoing
        FROM transactions
        WHERE from_address = NEW.from_address AND status = 'pending';

        IF (v_balance - v_pending_outgoing) < NEW.amount THEN
            RAISE EXCEPTION 'Insufficient balance for %: available %, requested %',
                NEW.from_address, (v_balance - v_pending_outgoing), NEW.amount;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_transaction
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION fn_validate_transaction();

-- Trigger 2: keep an aggregate in sync automatically, the same way the
-- checklist's citation-count example auto-updates a publication's count
-- when a citation is inserted. Here, a block's transaction_count/
-- total_volume update whenever a transaction is confirmed into it —
-- whether inserted already-confirmed (the coinbase reward) or transitioned
-- from pending to confirmed during mining.
CREATE OR REPLACE FUNCTION fn_update_block_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blocks
    SET transaction_count = transaction_count + 1,
        total_volume = total_volume + NEW.amount
    WHERE id = NEW.block_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_block_stats_on_insert
    AFTER INSERT ON transactions
    FOR EACH ROW
    WHEN (NEW.status = 'confirmed' AND NEW.block_id IS NOT NULL)
    EXECUTE FUNCTION fn_update_block_stats();

CREATE TRIGGER trg_update_block_stats_on_confirm
    AFTER UPDATE OF status ON transactions
    FOR EACH ROW
    WHEN (
        NEW.status = 'confirmed'
        AND OLD.status IS DISTINCT FROM 'confirmed'
        AND NEW.block_id IS NOT NULL
    )
    EXECUTE FUNCTION fn_update_block_stats();

-- Trigger 3: log sensitive actions to a shadow table, per the checklist's
-- own example. Large transfers are audited independently of the main
-- transactions table so the log survives even if the transaction row is
-- ever amended.
CREATE OR REPLACE FUNCTION fn_log_large_transfer()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount > 500 THEN
        INSERT INTO transaction_audit_log (
            transaction_id, from_address, to_address, amount, flagged_reason
        ) VALUES (
            NEW.id, NEW.from_address, NEW.to_address, NEW.amount, 'LARGE_TRANSFER'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_large_transfer
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_large_transfer();
