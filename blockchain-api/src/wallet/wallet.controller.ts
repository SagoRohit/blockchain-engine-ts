import { Controller, Get, Post, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';

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

    @ApiOkResponse({
        description: "Returns the authenticated user's own wallet addresses"
    })
    @ApiOperation({
        summary: 'List my wallets'
    })
    @Get('mine')
    listMine(@CurrentUser() user: CurrentUserPayload) {
        return this.walletservice.listWalletsForUser(user.userId);
    }

    @ApiOkResponse({
        description: 'Returns wallets whose owner\'s username matches the query'
    })
    @ApiOperation({
        summary: 'Look up a recipient by username (for the send-transaction / watchlist forms)'
    })
    @Public()
    @Get('search')
    search(@Query('username') username: string) {
        if (!username || username.trim().length < 2) {
            return [];
        }
        return this.walletservice.searchByUsername(username.trim());
    }
}
