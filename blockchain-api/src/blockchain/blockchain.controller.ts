import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MineDto } from './dto/mine.dto';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CurrentUser, type CurrentUserPayload } from '../auth/current-user.decorator';

@ApiTags('Blockchain')
@Controller('blockchain')
export class BlockchainController {
    constructor(
        private readonly blockchainService: BlockchainService
    ){}

    @ApiOkResponse({
        description: 'Returns Block in the chain'
    })
    @ApiNotFoundResponse({
        description: 'No Chain Available'
    })
    @ApiOperation({
        summary: 'Get all Blocks in the Chain'
    })
    @Public()
    @Get('/blocks')
    getBlockchain() {
        return this.blockchainService.getBlocks();
    }


    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Returns a new pending Transaction'
    })
    @ApiNotFoundResponse({
        description: 'Not a valid transaction/ Insufficient Money in the wallet'
    })
    @ApiOperation({
        summary: 'Creates a New Transaction (requires owning the sender wallet)'
    })
    @Post('transactions')
    createTransaction(
        @Body()
        dto: CreateTransactionDto,
        @CurrentUser()
        user: CurrentUserPayload,
    ){
        return this.blockchainService.createTransaction(dto, user);
    }



    @ApiBearerAuth()
    @ApiOkResponse({
        description: 'Returns Reward to the miner, with a new block created'
    })
    @ApiNotFoundResponse({
        description: 'No Chain Available'
    })
    @ApiOperation({
        summary: 'Mine Pending Transactions'
    })
    @Post('mine')
    mine (
        @Body()
        dto: MineDto,
    ){
        return this.blockchainService.mine(dto);
    }


    @ApiOkResponse({
        description: 'Returns The balance of given wallet'
    })
    @ApiNotFoundResponse({
        description: 'No wallet found'
    })
    @ApiOperation({
        summary: 'Get Balance of a given Address (Wallet)'
    })
    @Public()
    @Get('balance/:address')
    getBalance(
        @Param('address') address: string
    ) {
        return this.blockchainService.getBalance(address);
    }



    @ApiOkResponse({
        description: 'Returns Pending Transaction of the chain'
    })
    @ApiNotFoundResponse({
        description: 'No Chain Available'
    })
    @ApiOperation({
        summary: 'Shows all pending Transactions'
    })
    @Public()
    @Get('pending-transactions')
    getPendingTransactions(){
        return this.blockchainService.getPendingTransactions();
    }


    @ApiOkResponse({
        description: 'Returns Block of the given index'
    })
    @ApiNotFoundResponse({
        description: 'No Blocks for given index'
    })
    @ApiOperation({
        summary: 'Show the given index Block'
    })
    @Public()
    @Get('blocks/:index')
    getBlock(
        @Param('index', ParseIntPipe) index: number,
    ) {
        return this.blockchainService.getBlock(index);
    }


    @ApiOkResponse({
        description: 'Returns all the Transactions of the given wallet'
    })
    @ApiNotFoundResponse({
        description: 'No wallet found'
    })
    @ApiOperation({
        summary: 'Get all the Transactions of a wallet'
    })
    @Public()
    @Get('wallets/:address/transactions')
    getTransactions(
        @Param('address') address: string,
    ){
        return this.blockchainService.getTransactions(address);
    }


    @ApiOkResponse({
        description: 'Returns specific transaction'
    })
    @ApiNotFoundResponse({
        description: 'No Transaction available for this hash'
    })
    @ApiOperation({
        summary: 'Specific Transaction of a unique Hash'
    })
    @Public()
    @Get('transaction/:hash')
    getTransaction(
        @Param('hash') hash: string,
    ) {
        return this.blockchainService.getTransaction(hash);
    }


    @ApiOkResponse({
        description: 'Returns information about the chain'
    })
    @ApiNotFoundResponse({
        description: 'No Chain Available'
    })
    @ApiOperation({
        summary: 'All Information about the Blockchain'
    })
    @Public()
    @Get('info')
    getInfo() {
        return this.blockchainService.getInfo();
    }


    @ApiOkResponse({
        description: 'Returns True if valid'
    })
    @ApiNotFoundResponse({
        description: 'No chain available'
    })
    @ApiOperation({
        summary: 'To check if the chain is valid or not'
    })
    @Public()
    @Get('validate')
    isvalid() {
        return this.blockchainService.validate();
    }


    @ApiOkResponse({
        description: 'Returns the top wallets by confirmed balance (join + aggregation)'
    })
    @ApiOperation({
        summary: 'Top Wallets analytics page'
    })
    @Public()
    @Get('stats/top-wallets')
    getTopWallets(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.blockchainService.getTopWallets(limit);
    }


    @ApiOkResponse({
        description: 'Returns the most active addresses by confirmed transaction count'
    })
    @ApiOperation({
        summary: 'Most Active Addresses analytics page'
    })
    @Public()
    @Get('stats/most-active')
    getMostActiveAddresses(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.blockchainService.getMostActiveAddresses(limit);
    }


    @ApiOkResponse({
        description: 'Returns blocks ranked by total confirmed transaction volume'
    })
    @ApiOperation({
        summary: 'Block Leaderboard analytics page'
    })
    @Public()
    @Get('stats/block-leaderboard')
    getBlockLeaderboard(
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    ) {
        return this.blockchainService.getBlockLeaderboard(limit);
    }


    @ApiOkResponse({
        description: 'Returns a wallet\'s confirmed transaction history with a running balance'
    })
    @ApiNotFoundResponse({
        description: 'No wallet found'
    })
    @ApiOperation({
        summary: 'Wallet Statement (running balance via window function)'
    })
    @Public()
    @Get('wallets/:address/statement')
    getAddressStatement(
        @Param('address') address: string,
    ) {
        return this.blockchainService.getAddressStatement(address);
    }
}
