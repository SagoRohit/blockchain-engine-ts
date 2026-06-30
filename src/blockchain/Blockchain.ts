import { Block } from "./Block";
import { Transaction } from "./Transaction";

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
        this.difficulty = 3;
        this.mindingReward = 100;
    }
    public getLatestBlock() {
        return this.chain[this.chain.length -1];
    }

    public addTransaction(
        tx: Transaction
    ) : void {
        if(!tx.isValid())
            throw new Error("Invalid Transaction!");
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
}