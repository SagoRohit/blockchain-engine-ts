import { Wallet } from "../../wallet/Wallet";

describe("Wallet", () => {

    test("creates unique wallets", () => {

        const w1 = new Wallet();
        const w2 = new Wallet();

        expect(w1.publicKey)
            .not.toBe(w2.publicKey);

    });

    test("public key should not be empty", () => {

        const wallet = new Wallet();

        expect(wallet.publicKey.length)
            .toBeGreaterThan(0);

    });

});