import { Wallet } from "../../wallet/Wallet";

describe("Transaction", () => {

    test("creates a valid signed transaction", () => {

        const alice = new Wallet();
        const bob = new Wallet();

        const tx =
            alice.createTransaction(
                bob.publicKey,
                100
            );

        expect(tx.isValid())
            .toBe(true);

    });
    test("transaction is signed after creation", () => {

    const alice = new Wallet();
    const bob = new Wallet();

    const tx =
        alice.createTransaction(
            bob.publicKey,
            10
        );

    expect(tx.getSignature())
        .toBeDefined();

    });

});