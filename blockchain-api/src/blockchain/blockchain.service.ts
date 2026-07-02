import { Blockchain } from 'blockchain-engine';
import { Block } from 'blockchain-engine'
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
    private readonly blockchain: Blockchain;
    constructor() {
        this.blockchain = new Blockchain();
    }

    getBlocks(): Block[] {
        return this.blockchain.getBlocks();
    }
}
