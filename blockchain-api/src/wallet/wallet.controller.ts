import { Controller, Get, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
    constructor(
        private readonly walletservice: WalletService
    ) {}

    @ApiOkResponse({
            description: 'Returns a wallet address'
        })
     @ApiNotFoundResponse({
        description: 'invalid'
    })
    @ApiOperation({
        summary: "Creates New Wallet"
    })
    @Post()
    createWallet() {
        return this.walletservice.createWallet();
    }
}
