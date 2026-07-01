import { Block } from "../../blockchain/Block";

describe("Block", () => {

    test("mining satisfies difficulty", () => {

        const block =
            new Block([], "0");

        block.mine(3);

        expect(
            block.getHash().startsWith("000")
        ).toBe(true);

    });
    test("nonce changes after mining", () => {

    const block =
        new Block([], "0");

    const oldNonce =
        block.nonce;

    block.mine(2);

    expect(block.nonce)
        .toBeGreaterThan(oldNonce);

    });

});