import { Blockchain } from 'blockchain-engine';
import { Block } from 'blockchain-engine'
import { Transaction, Wallet } from 'blockchain-engine'
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletService } from 'src/wallet/wallet.service';
import { MineDto } from './dto/mine.dto';

@Injectable()
export class BlockchainService {
    private readonly blockchain: Blockchain;
    constructor(
        private readonly walletService: WalletService
    ) {
        this.blockchain = new Blockchain();
    }

    getBlocks(): Block[] {
        return this.blockchain.getBlocks();
    }

    createTransaction( dto: CreateTransactionDto) {
        const wallet = this.walletService.getWallet(dto.from);
        if(!wallet)
            throw new Error("Sender wallet Not found!");
        const transaction = wallet.createTransaction(dto.to, dto.amount);
        this.blockchain.addTransaction(transaction);
        return {
            message: "Transaction Created Successfully"
        };
    }

    mine(dto: MineDto) {
        const wallet = this.walletService.getWallet(dto.minerAddress);
        if(!wallet)
            throw new Error('Miner address not found!');
        this.blockchain.minePendingTransaction(dto.minerAddress);
        return {
            message: "Block Mined Successfully"
        }
    }

    getBalance(address: string) {
        const wallet = this.walletService.getWallet(address);
        if(!wallet)
            throw new Error("Wallet not found!");
        const balance = this.blockchain.getBalanceofAddress(address);
        return {
            address,
            balance
        };
    }

    getPendingTransactions() {
        return this.blockchain.getPendingTransactions();
    }

    getBlock(index: number) {
        const block = this.blockchain.getBlock(index);
        if(!block)
            throw new NotFoundException(
                `Block ${index} not found!`,
        )
        return block;
    }

    getTransactions(address: string) {
        const wallet = this.walletService.getWallet(address);
        if(!wallet)
            throw new Error("Wallet not found!");
        
        return this.blockchain.getTransactionsOfAddress(address);
    }
}
