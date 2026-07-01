// console.log('Hello Blockchain!');
// export class indi {}
// export * from "./typescript_learning"
// import { Transaction } from "./blockchain/Transaction";
import { Block } from "./blockchain/Block";
import { Blockchain } from "./blockchain/Blockchain";
import { Transaction } from "./blockchain/Transaction";
import { Wallet } from "./wallet/Wallet";

// const tx = new Transaction("Alice", "Bob", 20);

// console.log(tx);
// console.log("Caldulated Hash: ",tx.calculateHash());

// const alice = new Wallet();
// const Bob = new Wallet();
// const miner = new Wallet();

// const tx = new Transaction(Bob.publicKey, alice.publicKey, 100);
// const tx = new Transaction(null,Bob.publicKey, 10);
// // console.log(tx.isValid());
// // console.log(tx);

// const block = new Block([], "0");
// console.time("Mining");
// block.mine(6);
// console.timeEnd("Mining");
// console.log(block.nonce);

// const blockchain = new Blockchain();

// const tx = alice.createTransaction(Bob.publicKey, 100);
// // console.log(tx);
// // console.log(tx.isValid());

// blockchain.addTransaction(tx);
// blockchain.minePendingTransaction(miner.publicKey);

// console.log(blockchain);

// const tx = alice.createTransaction(Bob.publicKey, 100);

// console.log("Hash:", tx.calculateHash());

// console.log("Valid:", tx.isValid());


const blockchain = new Blockchain();

const alice = new Wallet();
const bob = new Wallet();
const miner = new Wallet();

const tx = alice.createTransaction(
    bob.publicKey,
    100
);

blockchain.addTransaction(tx);

blockchain.minePendingTransaction(miner.publicKey);

console.log(
    blockchain.getBalanceofAddress(alice.publicKey)
);

console.log(
    blockchain.getBalanceofAddress(bob.publicKey)
);

console.log(
    blockchain.getBalanceofAddress(miner.publicKey)
);
blockchain.minePendingTransaction(miner.publicKey);
console.log(
    blockchain.getBalanceofAddress(miner.publicKey)
);