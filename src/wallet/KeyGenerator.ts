import {ec as EC} from "elliptic";
const ec = new EC("secp256k1");

export class KeyGenerator {
    public static generate() {
        const keypair = ec.genKeyPair();

        return {
            privateKey : keypair.getPrivate('hex'),
            publicKey  : keypair.getPublic('hex')
        };
    }
}