export interface AuthResponse {
    accessToken: string;
    user: { id: string; username: string; email: string };
}

export interface Transaction {
    id: string;
    tx_hash: string;
    from_address: string | null;
    to_address: string;
    amount: string;
    signature: string | null;
    status: 'pending' | 'confirmed';
    block_id: string | null;
    created_at: string;
    confirmed_at: string | null;
}

// Matches exactly what GET /blockchain/wallets/:address/statement selects —
// it does not return the transaction's row id, unlike other endpoints.
export interface StatementEntry {
    tx_hash: string;
    from_address: string | null;
    to_address: string;
    amount: string;
    confirmed_at: string;
    running_balance: string;
}

export interface Block {
    id: string;
    index: number;
    previous_hash: string;
    hash: string;
    nonce: string;
    difficulty: number;
    miner_address: string;
    transaction_count: number;
    total_volume: string;
    mined_at: string;
}

export interface BlockDetail extends Block {
    transactions: Transaction[];
}

export interface NetworkInfo {
    height: number;
    difficulty: number;
    miningReward: number;
    total_blocks: string;
    total_transactions: string;
    total_volume: string;
    avg_block_time: { hours?: number; minutes?: number; seconds?: number; milliseconds?: number };
}

export interface TopWallet {
    address: string;
    username: string;
    balance: string;
}

export interface ActiveAddress {
    address: string;
    transaction_count: string;
}

export interface LeaderboardBlock {
    index: number;
    hash: string;
    mined_at: string;
    miner_username: string;
    transaction_count: string;
    total_volume: string;
}

export interface WatchlistEntry {
    id: string;
    user_id: string;
    watched_address: string;
    created_at: string;
}

export interface WalletSummary {
    address: string;
    created_at: string;
}
