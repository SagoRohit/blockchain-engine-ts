// // variable learning
// const age = 23;
// const difficulty = 2;
// const cgpa : number = 2.14;  // variable name : data type
// const username = "sagor";
// const walletAddress = "04kdhg";

// const isvalid = true;

// let balance = 40;
// balance = 50;
// //balance = "sagor";




// // function writing
// function square (number: number) : number {
//     return number * number;
// }
// // arrow function
// const add = (a: number, b: number) : number => {
//     return a*b;
// }
// // shorter version
// const subtract = (a: number, b: number): number => (a-b);




// // writing objects
// const student1 = {
//     name: 'Sagor',
//     id: 10,
//     cgpa: 3.10
// }
// // defining explicitly
// const student: {
//     name: string,
//     id : number,
//     cgpa : number
// } = {
//     name : 'sagor',
//     id : 10,
//     cgpa : 10
// }
// student.cgpa = 17; // modifying

// // nested object
// const wallet = {
//     owner : {
//         name : 'sagor',
//         id : 10,
//     },
//     balance : 10,
//     address : '903nfi'
// }

// // array
// const arr1 = [10,10,10,20];
// const arr2 : number[] = [1,2,3,4];
// const arrobj = [ // array of object
//     {
//         name: 'alice',
//         id: 1
//     },
//     {
//         name: 'bob',
//         id: 2
//     }
// ]
// console.log(arrobj[2].id); // prints 2;


// // block chain analogy
// const block = { // block is an object
//     transactions: [ // block contains multiple transactions, so array
//         { // transaction itself is an object
//             from : 'alice',
//             to : 'bob',
//             amount: 10
//         },
//         {
//             from : 'bob',
//             to : 'alice',
//             amount : 10
//         }
//     ]
// }

// for(const transaction of block.transactions) {
//     console.log(transaction);
// }


// // interface
// interface transaction  {
//     readonly from : string; // this can not be changed
//     to : string;
//     amount? : number; // it is optional
// }
// const tx1 : transaction = { // creating object
//     from : 'alice',
//     to : 'bob',
//     amount : 10
// }
// const tx2 : transaction = { //creating another object
//     from : 'bob',
//     to : 'alice',
//     amount : 19
// }

// // extends
// interface person {
//     name: string
// }
// interface miner extends person {
//     hashpower : number
// }

// // blockchain analogy
// interface Transaction {
//     from : string;
//     to : string;
//     amount : number;
//     signature ?: number;
// }
// interface block {
//     timestamp : number;
//     previousHash : string;
//     hash : string;
//     nonce : number;
//     transactions : Transaction[];  // array of Transaction interface
// }



// // classes
// class Wallet {
//     static blockchainname = "minichain";
//     owner : string;
//     private balance : number;
//     constructor(owner: string, balance: number) {
//         this.owner = owner;
//         this.balance = balance;
//     }
//     deposit(amount : number) {
//         this.balance += amount;
//     }
//     withdraw(amount : number) {
//         this.balance -= amount;
//     }
// };
// const wall1 = new Wallet ("alice", 500);
// // wall1.balance = 10; can't access a private method or memeber, it's called encapsulation
// console.log(Wallet.blockchainname) // static member does not need any object to access


// // inheritance
// class person { // shorthand syntax
//     constructor (
//         public name: string,
//         public age : number
//     ) {}
//     introduce() {
//         console.log("hello");
//     }
// }
// class Student extends person {
//     constructor (
//         name : string,
//         age : number,
//         public cgpa : number
//     ) {
//         super (name, age)
//     }
//     study() {
//         console.log("studying");
//     }
//     introduce(): void {
//         console.log("hello, i am a student");
//     }
// }
// class teacher extends person {
//     constructor (
//         name : string,
//         age : number,
//         public duration : number
//     ) {
//         super(name, age) //  this goes to parent class constructor
//     }
//     teach() {
//         console.log("teaching");
//     }
//     introduce(): void {
//         console.log("i am a student");
//     }
// }

// // but using this extension may lead to a large number of dependency. rather using is-it, we should consider to has-it
// // here composition wins
// // that's why we use abstract class
// abstract class blockchainObject {
//     abstract calculateHash():string;
// }


// export class trans {}
// import {indi} from "./index"