import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'crypto';

// Server-custodied wallets (this project signs on the user's behalf, like
// the original in-memory design) still shouldn't store private keys in
// plaintext. AES-256-GCM with a key derived from WALLET_ENCRYPTION_KEY.
const ALGORITHM = 'aes-256-gcm';

export function encryptPrivateKey(privateKey: string, passphrase: string): string {
    const salt = randomBytes(16);
    const iv = randomBytes(12);
    const key = scryptSync(passphrase, salt, 32);

    const cipher = createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(privateKey, 'utf8'),
        cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return [salt, iv, authTag, ciphertext]
        .map((buf) => buf.toString('hex'))
        .join(':');
}

export function decryptPrivateKey(payload: string, passphrase: string): string {
    const [saltHex, ivHex, authTagHex, ciphertextHex] = payload.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');
    const key = scryptSync(passphrase, salt, 32);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
    ]).toString('utf8');
}
