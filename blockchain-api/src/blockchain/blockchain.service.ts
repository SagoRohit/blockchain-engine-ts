import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { Block, Transaction } from 'blockchain-engine';
import { DatabaseService } from '../database/database.service';
import { WalletService } from '../wallet/wallet.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MineDto } from './dto/mine.dto';
import type { CurrentUserPayload } from '../auth/current-user.decorator';

const DIFFICULTY = 4;
const MINING_REWARD = 100;

export interface BlockRow {
    id: string;
    index: number;
    previous_hash: string;
    hash: string;
    nonce: string;
    difficulty: number;
    miner_address: string;
    transaction_count: number;
    total_volume: string;
    mined_at: Date;
}

export interface TransactionRow {
    id: string;
    tx_hash: string;
    from_address: string | null;
    to_address: string;
    amount: string;
    signature: string | null;
    status: 'pending' | 'confirmed';
    block_id: string | null;
    created_at: Date;
    confirmed_at: Date | null;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
    constructor(
        private readonly db: DatabaseService,
        private readonly walletService: WalletService,
    ) {}

    // Seeds a genesis block the first time the app starts against an empty
    // database — Postgres now owns chain state, there is no more in-memory
    // Blockchain instance to create one implicitly.
    async onModuleInit() {
        const { rows } = await this.db.query<{ count: string }>(
            'SELECT COUNT(*) FROM blocks',
        );
        if (Number(rows[0].count) > 0) return;

        const genesis = new Block([], '0');
        await this.db.withTransaction((client) =>
            client.query(
                `INSERT INTO blocks (index, previous_hash, hash, nonce, difficulty, miner_address)
                 VALUES (0, '0', $1, $2, 0, 'GENESIS')`,
                [genesis.getHash(), genesis.nonce],
            ),
        );
    }

    async createTransaction(dto: CreateTransactionDto, user: CurrentUserPayload) {
        const wallet = await this.walletService.getWallet(dto.from);
        if (!wallet) {
            throw new NotFoundException('Sender wallet not found!');
        }
        if (wallet.user_id !== user.userId) {
            throw new ForbiddenException('You do not own this wallet');
        }

        const privateKey = this.walletService.decryptPrivateKeyFor(wallet);
        const tx = new Transaction(dto.from, dto.to, dto.amount);
        tx.sign(privateKey);

        if (!tx.isValid()) {
            throw new BadRequestException('Invalid transaction');
        }

        try {
            await this.db.withTransaction((client) =>
                client.query(
                    `INSERT INTO transactions (tx_hash, from_address, to_address, amount, signature, status)
                     VALUES ($1, $2, $3, $4, $5, 'pending')`,
                    [tx.calculateHash(), dto.from, dto.to, dto.amount, tx.getSignature()],
                ),
            );
        } catch (err) {
            throw new BadRequestException((err as Error).message);
        }

        return { message: 'Transaction Created Successfully' };
    }

    async mine(dto: MineDto) {
        const minerWallet = await this.walletService.getWallet(dto.minerAddress);
        if (!minerWallet) {
            throw new NotFoundException('Miner address not found!');
        }

        const latest = await this.getLatestBlockRow();

        const pendingResult = await this.db.query<TransactionRow>(
            "SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at",
        );
        // Block.mine()/calculateHash() only ever JSON.stringify()s this
        // array — plain objects with the same shape as Transaction work
        // without reconstructing signed engine instances.
        const pendingTxs = pendingResult.rows.map((row) => ({
            fromAddress: row.from_address,
            toAddress: row.to_address,
            amount: Number(row.amount),
            timestamp: row.created_at.getTime(),
            signature: row.signature ?? undefined,
        }));

        const block = new Block(pendingTxs as unknown as Transaction[], latest.hash);
        block.mine(DIFFICULTY);

        const rewardTx = new Transaction(null, dto.minerAddress, MINING_REWARD);

        await this.db.withTransaction((client) =>
            client.query(
                `CALL mine_block($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    dto.minerAddress,
                    latest.index + 1,
                    latest.hash,
                    block.getHash(),
                    block.nonce,
                    DIFFICULTY,
                    MINING_REWARD,
                    rewardTx.calculateHash(),
                    null,
                ],
            ),
        );

        return {
            message: 'Block Mined Successfully',
            index: latest.index + 1,
            hash: block.getHash(),
        };
    }

    getBalance(address: string) {
        return this.walletService.getBalance(address);
    }

    async getBlocks() {
        const { rows } = await this.db.query<BlockRow>(
            'SELECT * FROM blocks ORDER BY index',
        );
        return rows;
    }

    async getBlock(index: number) {
        const { rows } = await this.db.query<BlockRow>(
            'SELECT * FROM blocks WHERE index = $1',
            [index],
        );
        const block = rows[0];
        if (!block) {
            throw new NotFoundException(`Block ${index} not found!`);
        }

        const { rows: transactions } = await this.db.query<TransactionRow>(
            'SELECT * FROM transactions WHERE block_id = $1 ORDER BY created_at',
            [block.id],
        );

        return { ...block, transactions };
    }

    async getPendingTransactions() {
        const { rows } = await this.db.query<TransactionRow>(
            "SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at",
        );
        return rows;
    }

    async getTransactions(address: string) {
        const wallet = await this.walletService.getWallet(address);
        if (!wallet) {
            throw new NotFoundException('Wallet not found!');
        }

        const { rows } = await this.db.query<TransactionRow>(
            'SELECT * FROM transactions WHERE from_address = $1 OR to_address = $1 ORDER BY created_at',
            [address],
        );
        return rows;
    }

    async getTransaction(hash: string) {
        const { rows } = await this.db.query<TransactionRow>(
            'SELECT * FROM transactions WHERE tx_hash = $1',
            [hash],
        );
        if (!rows[0]) {
            throw new NotFoundException('Transaction not found');
        }
        return rows[0];
    }

    async getInfo() {
        const latest = await this.getLatestBlockRow();
        const { rows } = await this.db.query('SELECT * FROM get_network_stats()');

        return {
            height: latest.index,
            difficulty: DIFFICULTY,
            miningReward: MINING_REWARD,
            ...rows[0],
        };
    }

    // Simplified integrity check: confirms every persisted block correctly
    // references its predecessor's hash. Per-transaction signature
    // re-verification already happened at insert time (app-level
    // Transaction.isValid() plus the DB trigger), so it isn't repeated here.
    async validate() {
        const { rows: blocks } = await this.db.query<BlockRow>(
            'SELECT * FROM blocks ORDER BY index',
        );

        for (let i = 1; i < blocks.length; i++) {
            if (blocks[i].previous_hash !== blocks[i - 1].hash) {
                return { valid: false };
            }
        }
        return { valid: true };
    }

    // ============================
    // Complex queries (analytics)
    // ============================

    async getTopWallets(limit = 10) {
        const { rows } = await this.db.query(
            `SELECT
                w.address,
                u.username,
                COALESCE(SUM(
                    CASE
                        WHEN t.to_address = w.address THEN t.amount
                        WHEN t.from_address = w.address THEN -t.amount
                        ELSE 0
                    END
                ), 0) AS balance
             FROM wallets w
             JOIN users u ON u.id = w.user_id
             LEFT JOIN transactions t
                ON (t.to_address = w.address OR t.from_address = w.address)
                AND t.status = 'confirmed'
             GROUP BY w.address, u.username
             ORDER BY balance DESC
             LIMIT $1`,
            [limit],
        );
        return rows;
    }

    async getMostActiveAddresses(limit = 10) {
        const { rows } = await this.db.query(
            `SELECT address, COUNT(*) AS transaction_count
             FROM (
                SELECT from_address AS address FROM transactions
                WHERE status = 'confirmed' AND from_address IS NOT NULL
                UNION ALL
                SELECT to_address AS address FROM transactions
                WHERE status = 'confirmed'
             ) addresses
             GROUP BY address
             ORDER BY transaction_count DESC
             LIMIT $1`,
            [limit],
        );
        return rows;
    }

    async getBlockLeaderboard(limit = 10) {
        const { rows } = await this.db.query(
            `SELECT
                b.index,
                b.hash,
                b.mined_at,
                u.username AS miner_username,
                COUNT(t.id) AS transaction_count,
                COALESCE(SUM(t.amount), 0) AS total_volume
             FROM blocks b
             JOIN transactions t ON t.block_id = b.id
             JOIN wallets w ON w.address = b.miner_address
             JOIN users u ON u.id = w.user_id
             GROUP BY b.id, u.username
             ORDER BY total_volume DESC
             LIMIT $1`,
            [limit],
        );
        return rows;
    }

    async getAddressStatement(address: string) {
        const wallet = await this.walletService.getWallet(address);
        if (!wallet) {
            throw new NotFoundException('Wallet not found!');
        }

        const { rows } = await this.db.query(
            `SELECT
                tx_hash,
                from_address,
                to_address,
                amount,
                confirmed_at,
                SUM(
                    CASE WHEN to_address = $1 THEN amount ELSE -amount END
                ) OVER (ORDER BY confirmed_at) AS running_balance
             FROM transactions
             WHERE status = 'confirmed' AND (from_address = $1 OR to_address = $1)
             ORDER BY confirmed_at`,
            [address],
        );
        return rows;
    }

    private async getLatestBlockRow(): Promise<BlockRow> {
        const { rows } = await this.db.query<BlockRow>(
            'SELECT * FROM blocks ORDER BY index DESC LIMIT 1',
        );
        if (!rows[0]) {
            throw new NotFoundException('No chain available');
        }
        return rows[0];
    }
}
