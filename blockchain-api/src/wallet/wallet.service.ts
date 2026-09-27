import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyGenerator } from 'blockchain-engine';
import { DatabaseService } from '../database/database.service';
import { encryptPrivateKey, decryptPrivateKey } from '../common/wallet-crypto.util';

export interface WalletRow {
    id: string;
    user_id: string;
    address: string;
    encrypted_private_key: string;
    created_at: Date;
}

@Injectable()
export class WalletService {
    constructor(
        private readonly db: DatabaseService,
        private readonly config: ConfigService,
    ) {}

    async createWallet(userId: string): Promise<{ address: string }> {
        const { privateKey, publicKey } = KeyGenerator.generate();
        const encryptedPrivateKey = encryptPrivateKey(
            privateKey,
            this.config.get<string>('WALLET_ENCRYPTION_KEY')!,
        );

        await this.db.withTransaction((client) =>
            client.query(
                `INSERT INTO wallets (user_id, address, encrypted_private_key)
                 VALUES ($1, $2, $3)`,
                [userId, publicKey, encryptedPrivateKey],
            ),
        );

        return { address: publicKey };
    }

    async getWallet(address: string): Promise<WalletRow | null> {
        const result = await this.db.query<WalletRow>(
            'SELECT * FROM wallets WHERE address = $1',
            [address],
        );
        return result.rows[0] ?? null;
    }

    async getBalance(address: string): Promise<{ address: string; balance: number }> {
        const wallet = await this.getWallet(address);
        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        const result = await this.db.query<{ get_wallet_balance: string }>(
            'SELECT get_wallet_balance($1)',
            [address],
        );

        return { address, balance: Number(result.rows[0].get_wallet_balance) };
    }

    // Decrypts a wallet's private key for signing. Only ever called after
    // an ownership check (the caller must confirm wallet.user_id === the
    // authenticated user) — see BlockchainService.createTransaction.
    decryptPrivateKeyFor(wallet: WalletRow): string {
        return decryptPrivateKey(
            wallet.encrypted_private_key,
            this.config.get<string>('WALLET_ENCRYPTION_KEY')!,
        );
    }
}
