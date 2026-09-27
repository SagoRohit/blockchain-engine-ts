import { Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../auth/current-user.decorator';

@ApiTags('Wallet')
@ApiBearerAuth()
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
        summary: "Creates a new wallet owned by the authenticated user"
    })
    @Post()
    createWallet(@CurrentUser() user: CurrentUserPayload) {
        return this.walletservice.createWallet(user.userId);
    }
}
