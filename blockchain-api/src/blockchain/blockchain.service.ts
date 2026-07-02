import { Blockchain } from 'blockchain-engine';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
    private readonly blockchain: Blockchain;
    constructor() {
        this.blockchain = new Blockchain();
    }

    getBlockChain(): Blockchain {
        return this.blockchain;
    }
}
