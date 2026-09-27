-- mine_block: the multi-step, multi-table workflow example from the
-- checklist ("uploading a publication inserts the paper, inserts authors,
-- and updates statistics — in one transaction"), applied to mining:
--   1. insert the newly-mined block
--   2. confirm every pending transaction into that block
--   3. insert the miner's coinbase reward transaction
--
-- Proof-of-work itself (finding the nonce) stays in Node, using the
-- existing Block.mine() from blockchain-engine — that is CPU-bound
-- iterative hashing, not something SQL should do. This procedure only
-- persists the block that Node already mined. The caller (blockchain.service)
-- still wraps this CALL in an explicit BEGIN/COMMIT/ROLLBACK, since a
-- procedure call is itself one DML operation among others in that request.
CREATE OR REPLACE PROCEDURE mine_block(
    p_miner_address  TEXT,
    p_index          INTEGER,
    p_previous_hash  TEXT,
    p_hash           TEXT,
    p_nonce          BIGINT,
    p_difficulty     INTEGER,
    p_reward_amount  NUMERIC,
    p_reward_tx_hash TEXT,
    INOUT p_block_id UUID DEFAULT NULL
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO blocks (index, previous_hash, hash, nonce, difficulty, miner_address)
    VALUES (p_index, p_previous_hash, p_hash, p_nonce, p_difficulty, p_miner_address)
    RETURNING id INTO p_block_id;

    UPDATE transactions
    SET status = 'confirmed', block_id = p_block_id, confirmed_at = now()
    WHERE status = 'pending';

    INSERT INTO transactions (
        tx_hash, from_address, to_address, amount, signature, status, block_id, confirmed_at
    ) VALUES (
        p_reward_tx_hash, NULL, p_miner_address, p_reward_amount, NULL, 'confirmed', p_block_id, now()
    );
END;
$$;
