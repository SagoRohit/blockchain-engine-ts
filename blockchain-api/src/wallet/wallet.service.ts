import { Injectable } from '@nestjs/common';
import { Wallet } from 'blockchain-engine'

@Injectable()
export class WalletService {
    private readonly wallets: Map<string, Wallet>;
    constructor() {
        this.wallets = new Map();
    }
    createWallet(){
        const wallet = new Wallet();
        this.wallets.set(wallet.publicKey, wallet);
        return {
            address: wallet.publicKey,
        };
    }
    getWallet(address: string) {
        return this.wallets.get(address);
    }
}
