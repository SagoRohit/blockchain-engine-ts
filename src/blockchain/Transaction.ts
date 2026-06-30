import { throwDeprecation } from "node:process";
import { Hash } from "../crypto/Hash";
import { Signature } from "../crypto/Signature";
import {ec as EC} from "elliptic";
const ec = new EC("secp256k1");

export class Transaction {
    public readonly fromAddress : string | null;
    public readonly toAddress : string;
    public readonly amount : number;
    public readonly timestamp : number;

    private signature? : string;

    constructor (
        fromAddress: string | null, 
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
        this.signature = Signature.sign(transactionHash, privateKey);
    }

    public isValid() : boolean {
        if(this.fromAddress == null) // reward, send by system so do not have any signature
            return true;
        if(!this.fromAddress)
            throw new Error("Transaction must have a sender");
        if(!this.toAddress)
            throw new Error("Transaction must have a receiver");
        if(this.amount <= 0)
            throw new Error("Transaction amont must be greater than zero");
        if(!this.signature)
            throw new Error("Transaction is not signed");
        return Signature.verify(
            this.calculateHash(),
            this.signature,
            this.fromAddress,
        )
    }
}