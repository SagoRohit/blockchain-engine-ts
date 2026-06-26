/*
                                    Wallet

                                    --------------------------------

                                    private privateKey

                                    public publicKey

                                    --------------------------------

                                    constructor()

                                    createTransaction()

                                    signTransaction()

                                    getPublicKey()
*/

import { Transaction } from "../blockchain/Transaction";
import { KeyGenerator } from "./KeyGenerator";

export class Wallet {
    private readonly privateKey : string;
    public readonly publicKey : string;

    constructor() {
        const keys = KeyGenerator.generate();
        this.privateKey = keys.privateKey;
        this.publicKey = keys.publicKey;
    }

    public createTransaction(
        receiver : string,
        amount : number
    ): Transaction {
        const tx = new Transaction(this.publicKey, receiver, amount);
        this.signTransaction(tx);
        return tx;
    }

    private signTransaction(
        transaction: Transaction
    ): void {
        transaction.sign(this.privateKey);
    }
}