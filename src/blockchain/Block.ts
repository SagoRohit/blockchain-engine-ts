/*
        Block
    ----------------------
    Properties

    timestamp
    transactions
    previousHash
    hash
    nonce
    ----------------------
    Methods

    constructor()
    calculateHash()
    mine() // block knows how to search for a valid nonce
    hasValidTransactions()  // a block is valid, if it's every transaction is valid


    Hash = previousHash + timestamp + transactions + nonce
*/

import { Transaction } from "./Transaction";
import { Hash } from "../crypto/hash";
import { diff } from "node:util";


export class Block {
    public readonly timestamp : number;
    public readonly previousHash : string;
    public readonly transactions : Transaction [];
    public hash : string;
    public nonce : number;

    constructor  (
        transactions : Transaction[],
        prevHash : string
    ) {
        this.timestamp = Date.now();
        this.previousHash = prevHash;
        this.transactions = transactions;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    public calculateHash(): string {
        const data = 
        this.timestamp +
        this.previousHash +
        JSON.stringify(this.transactions) +
        this.nonce;

        return Hash.hash(data);
    }

    public hasValidTransactions(): boolean {
        for(const tx of this.transactions){
            if(!tx.isValid())
                return false;
        }
        return true;
    }

    public mine(difficulty : number): void {
        const leading = "0".repeat(difficulty);
        while(!this.hash.startsWith(leading)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }
}