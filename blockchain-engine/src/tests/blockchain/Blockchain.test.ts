import { Blockchain } from "../../blockchain/Blockchain";
import { Wallet } from "../../wallet/Wallet";

describe("Blockchain", () => {
    let blockchain: Blockchain;
    let alice: Wallet;
    let bob: Wallet;
    let miner: Wallet;

    /**
     * Creates a fresh blockchain and wallets before every test.
     */
    beforeEach(() => {
        blockchain = new Blockchain();

        alice = new Wallet();
        bob = new Wallet();
        miner = new Wallet();
    });

    /**
     * Helper function to give a wallet mining rewards.
     * Since rewards are paid in the next mined block,
     * we mine twice.
     */
    function fundWallet(wallet: Wallet): void {
        blockchain.minePendingTransaction(wallet.publicKey);
        blockchain.minePendingTransaction(wallet.publicKey);
    }

    test("contains genesis block", () => {
        expect(blockchain.getBlocks().length).toBe(1);
    });

    test("adds pending transaction", () => {
        fundWallet(alice);

        blockchain.addTransaction(
            alice.createTransaction(
                bob.publicKey,
                50
            )
        );

        expect(
            blockchain.getPendingTransactions().length
        ).toBe(2);
    });

    test("mining creates new block", () => {
        fundWallet(alice);

        blockchain.addTransaction(
            alice.createTransaction(
                bob.publicKey,
                50
            )
        );

        blockchain.minePendingTransaction(miner.publicKey);

        expect(
            blockchain.getBlocks().length
        ).toBe(4);
    });

    test("chain remains valid", () => {
        fundWallet(alice);

        blockchain.addTransaction(
            alice.createTransaction(
                bob.publicKey,
                20
            )
        );

        blockchain.minePendingTransaction(miner.publicKey);

        expect(
            blockchain.isChainValid()
        ).toBe(true);
    });

    test("balance is updated", () => {
        fundWallet(alice);

        blockchain.addTransaction(
            alice.createTransaction(
                bob.publicKey,
                50
            )
        );

        blockchain.minePendingTransaction(miner.publicKey);

        expect(
            blockchain.getBalanceofAddress(
                bob.publicKey
            )
        ).toBe(50);
    });

    test("miner receives reward after next block", () => {
        blockchain.minePendingTransaction(
            miner.publicKey
        );

        blockchain.minePendingTransaction(
            miner.publicKey
        );

        expect(
            blockchain.getBalanceofAddress(
                miner.publicKey
            )
        ).toBeGreaterThan(0);
    });
});