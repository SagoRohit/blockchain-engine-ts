import { Hash } from "../crypto/hash";
import { signature } from "../crypto/signature";
import {ec as EC} from "elliptic";
const ec = new EC("secp256k1");

export class Transaction {
    public readonly fromAddress : string;
    public readonly toAddress : string;
    public readonly amount : number;
    public readonly timestamp : number;

    private signature? : string;

    constructor (
        fromAddress: string, 
        toAddress: string, 
        amount: number
    ) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timestamp = Date.now();
    }

    public calculateHash():string {
        const data = 
        this.fromAddress + 
        this.toAddress +
        this.amount +
        this.timestamp;

        return Hash.hash(data);
    }
    // here why don't we store hash? it's a derived data, if transaction is changed, then hash need to be stored manually, so 
    // it is derived when needed.

    public sign (privateKey: string) : void {
        if(this.signature)
            throw new Error("Transaction is already signed");

        const key = ec.keyFromPrivate(privateKey);
        const derivedPublicKey = key.getPublic('hex');

        if(derivedPublicKey !== this.fromAddress)
                throw new Error('You can not make transaction from others wallet!');

        const transactionHash = this.calculateHash();
        this.signature = signature.sign(privateKey, transactionHash);
    }
}