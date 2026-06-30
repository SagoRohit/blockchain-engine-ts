/*
    signature
    -------------
    sign(), verify() --> both are static
*/
import {ec as EC} from "elliptic";
const ec = new EC("secp256k1");

export class Signature {
    public static sign(
        hash : string,
        privateKey : string
    ) {
        const Key = ec.keyFromPrivate(privateKey);
        return Key.sign(hash, 'hex').toDER('hex'); // sign the hash and return signature
    }

    public static verify(
        hash : string,
        signature : string,
        publicKey : string
    ) {
        const key = ec.keyFromPublic(publicKey, 'hex'); // key object generation
        return key.verify(hash, signature); // verification
    }
}