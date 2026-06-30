import { SHA256 } from "crypto-js";

export class Hash {
    public static hash(data: string): string {
        return SHA256(data).toString();
    }
}
// here why do we use static, because this class does not store anything, it's only job is to calculate the hash
// so if we call new hash(), it would waste memory, so we used static, so that we can access Hash.has(), thus way...