import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
    constructor(
        private readonly walletservice: WalletService
    ) {}
    @Post()
    createWallet() {
        return this.walletservice.createWallet();
    }
}
