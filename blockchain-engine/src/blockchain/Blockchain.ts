import { Block } from "./Block";
import { Transaction } from "./Transaction";
import {
    INITIAL_DIFFICULTY,
    MINING_REWARD,
} from "../type/constants";

export class Blockchain {
    private chain: Block[];
    private pendingTransactions: Transaction[];
    private difficulty: number;
    private miningReward: number;

    constructor(
        difficulty: number = INITIAL_DIFFICULTY
    ) {
        this.difficulty = difficulty;
        this.miningReward = MINING_REWARD;

        this.pendingTransactions = [];

        this.chain = [
            this.createGenesis()
        ];
    }

    // ============================
    // Private Helper Methods
    // ============================

    private createGenesis(): Block {
        return new Block([], "0");
    }

    private getPendingOutgoing(address: string): number {
        let total = 0;

        for (const tx of this.pendingTransactions) {
            if (tx.fromAddress === address) {
                total += tx.amount;
            }
        }

        return total;
    }

    private createRewardTransaction(
        minerAddress: string
    ): Transaction {
        return new Transaction(
            null,
            minerAddress,
            this.miningReward
        );
    }

    private createBlock(): Block {
        return new Block(
            this.pendingTransactions,
            this.getLatestBlock().getHash()
        );
    }

    // ============================
    // Public Methods
    // ============================

    public getLatestBlock(): Block {
        return this.chain[this.chain.length - 1];
    }

    public addTransaction(
        tx: Transaction
    ): void {

        if (!tx.isValid()) {
            throw new Error("Invalid Transaction!");
        }

        if (tx.fromAddress === null) {
            throw new Error(
                "Reward transactions cannot be added manually!"
            );
        }

        const available =
            this.getBalanceofAddress(tx.fromAddress) -
            this.getPendingOutgoing(tx.fromAddress);

        if (available < tx.amount) {
            throw new Error("Insufficient Balance!");
        }

        this.pendingTransactions.push(tx);
    }

    public minePendingTransaction(
        minerAddress: string
    ): void {

        const block = this.createBlock();

        block.mine(this.difficulty);

        this.chain.push(block);

        this.pendingTransactions = [
            this.createRewardTransaction(minerAddress)
        ];
    }

    public isChainValid(): boolean {

        for (let i = 1; i < this.chain.length; i++) {

            const current = this.chain[i];
            const previous = this.chain[i - 1];

            if (!current.hasValidTransactions()) {
                return false;
            }

            if (
                current.getHash() !==
                current.calculateHash()
            ) {
                return false;
            }

            if (
                current.previousHash !==
                previous.getHash()
            ) {
                return false;
            }
        }

        return true;
    }

    public getBalanceofAddress(
        address: string
    ): number {

        let balance = 0;

        for (const block of this.chain) {

            for (const tx of block.transactions) {

                if (tx.fromAddress === address) {
                    balance -= tx.amount;
                }

                if (tx.toAddress === address) {
                    balance += tx.amount;
                }
            }
        }

        return balance;
    }

    // ============================
    // Explorer Helper Methods
    // ============================

    public getBlocks(): ReadonlyArray<Block> {
        return [...this.chain];
    }

    public getBlock(
        index: number
    ): Block | null {

        if (
            index < 0 ||
            index >= this.chain.length
        ) {
            return null;
        }

        return this.chain[index];
    }

    public getPendingTransactions():
        ReadonlyArray<Transaction> {

        return [...this.pendingTransactions];
    }

    public getLatestBlockHeight(): number {
        return this.chain.length - 1;
    }

    public getDifficulty(): number {
        return this.difficulty;
    }

    public getMiningReward(): number {
        return this.miningReward;
    }

    public getTransactionsOfAddress(
        address: string
    ): Transaction[] {

        const transactions: Transaction[] = [];

        for (const block of this.chain) {

            for (const tx of block.transactions) {

                if (
                    tx.fromAddress === address ||
                    tx.toAddress === address
                ) {
                    transactions.push(tx);
                }
            }
        }

        return transactions;
    }

    public findTransaction(
        hash: string
    ): Transaction | null {

        for (const block of this.chain) {

            for (const tx of block.transactions) {

                if (
                    tx.calculateHash() === hash
                ) {
                    return tx;
                }
            }
        }

        return null;
    }
}