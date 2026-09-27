-- get_wallet_balance: computed value (never stored redundantly on the
-- wallets/users tables) derived from confirmed transaction history.
-- Mirrors the checklist's "h-index from publications/citations" example.
CREATE OR REPLACE FUNCTION get_wallet_balance(p_address TEXT)
RETURNS NUMERIC AS $$
DECLARE
    v_balance NUMERIC;
BEGIN
    SELECT
        COALESCE(SUM(CASE WHEN to_address = p_address THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN from_address = p_address THEN amount ELSE 0 END), 0)
    INTO v_balance
    FROM transactions
    WHERE status = 'confirmed'
      AND (to_address = p_address OR from_address = p_address);

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- get_network_stats: single statistical summary of the whole chain,
-- backs the explorer's dashboard.
CREATE OR REPLACE FUNCTION get_network_stats()
RETURNS TABLE (
    total_blocks       BIGINT,
    total_transactions BIGINT,
    total_volume       NUMERIC,
    avg_block_time     INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM blocks) AS total_blocks,
        (SELECT COUNT(*) FROM transactions WHERE status = 'confirmed') AS total_transactions,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'confirmed') AS total_volume,
        (
            SELECT CASE
                WHEN COUNT(*) > 1 THEN (MAX(mined_at) - MIN(mined_at)) / (COUNT(*) - 1)
                ELSE INTERVAL '0'
            END
            FROM blocks
        ) AS avg_block_time;
END;
$$ LANGUAGE plpgsql STABLE;
