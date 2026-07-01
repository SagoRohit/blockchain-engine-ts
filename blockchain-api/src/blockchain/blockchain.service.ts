import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
    getMessage(): string {
        return "Blockchain service works!";
    }
}
