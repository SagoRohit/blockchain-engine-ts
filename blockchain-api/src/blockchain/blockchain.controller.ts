import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MineDto } from './dto/mine.dto';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

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
    @Get('/blocks')
    getBlockchain() {
        return this.blockchainService.getBlocks();
    }


    @ApiOkResponse({
        description: 'Returns a new pending Transaction'
    })
    @ApiNotFoundResponse({
        description: 'Not a valid transaction/ Insufficient Money in the wallet'
    })
    @ApiOperation({
        summary: 'Creates a New Transaction'
    })
    @Post('transactions')
    createTransaction(
        @Body()
        dto: CreateTransactionDto,
    ){
        return this.blockchainService.createTransaction(dto);
    }



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
    @Get('validate')
    isvalid() {
        return this.blockchainService.validate();
    }
}

