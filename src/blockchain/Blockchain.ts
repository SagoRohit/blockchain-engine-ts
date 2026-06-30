import { transcode } from "node:buffer";
import { Block } from "./Block";
import { Transaction } from "./Transaction";
import { INITIAL_DIFFICULTY, MINING_REWARD } from "../type/constants";

export class Blockchain {
    private chain: Block [];
    private pendinTransaction: Transaction[];
    private difficulty: number;
    private mindingReward: number;

    private createGenesis(): Block {
        return new Block([], "0");
    }
    constructor() {
        this.chain = [
            this.createGenesis()
        ];
        this.pendinTransaction = [];
        this.difficulty = INITIAL_DIFFICULTY;
        this.mindingReward = MINING_REWARD;
    }
    private getPendingOutGoing(address:string): number {
        let total = 0;
        for(let tx of this.pendinTransaction) {
            if(tx.fromAddress === address)
                total += tx.amount;
        }
        return total;
    }
    public getLatestBlock() {
        return this.chain[this.chain.length -1];
    }

    public addTransaction(
        tx: Transaction
    ) : void {
        if(!tx.isValid())
            throw new Error("Invalid Transaction!");
        if(tx.fromAddress === null)
            throw new Error("Reward transactions can not be added manually!");
        const available = this.getBalanceofAddress(tx.fromAddress) -
                          this.getPendingOutGoing(tx.fromAddress);
        if(available < tx.amount)
            throw new Error("Insufficient Balance!");
        this.pendinTransaction.push(tx);
    }

    public minePendingTransaction(
        minderAddress: string
    ): void {
        const block = new Block(
            this.pendinTransaction,
            this.getLatestBlock().getHash()
        ); // block created
        block.mine(this.difficulty); // block mined
        this.chain.push(block); // push into the block-chain
        this.pendinTransaction = [
            new Transaction( // new transaction is created for the reward! which will go into the next block
                null,
                minderAddress,
                this.mindingReward
            )
        ]; // cleared the pending transaction list
    }

    public isChainValid(): boolean {
        for(let i=1; i<this.chain.length; i++) {
            const current = this.chain[i];
            const prev = this.chain[i-1];
            if(!current.hasValidTransactions())
                return false;
            if(current.getHash() !== current.calculateHash())
                return false;
            if(current.previousHash !== prev.getHash())
                return false;
        }
        return true;
    }
    public getBalanceofAddress(address: string): number {
        let balance = 0;
        for(let block of this.chain) {
            for(let tx of block.transactions) {
                if(tx.fromAddress === address)
                    balance -= tx.amount;
                if(tx.toAddress === address)
                    balance += tx.amount;
            }
        }
        return balance;
    }

    public getBlocks(): ReadonlyArray<Block> {
        return [...this.chain];
    }

    public getBlock(index: number): Block|null {
        if(index < 0 || index > this.chain.length)
            return null;
        return this.chain[index];
    }
    public getPendingTransactions():ReadonlyArray<Transaction>{
        return [...this.pendinTransaction];
    }
    public getLatestBlockHeight(): number{
        return this.chain.length - 1;
    }
    public getDifficulty(): number{
        return this.difficulty;
    }
    public getMiningReward(): number{
        return this.mindingReward;
    }
    public getTransactionsOfAddress(
        address: string
    ): Transaction[] {
        const transactions: Transaction[] = [];
        for(const block of this.chain){
            for(const tx of block.transactions) {
                if(tx.fromAddress === address || tx.toAddress === address)
                    transactions.push(tx);
            }
        }
        return transactions;
    }
    public findTransaction(
        hash: string
    ): Transaction | null {
        for(const block of this.chain) {
            for(const tx of block.transactions){
                if(tx.calculateHash() === hash)
                    return tx;
            }
        }
        return null;
    }
}