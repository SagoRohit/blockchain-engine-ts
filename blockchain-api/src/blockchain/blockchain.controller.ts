import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MineDto } from './dto/mine.dto';


@Controller('blockchain')
export class BlockchainController {
    constructor(
        private readonly blockchainService: BlockchainService
    ){}

    @Get('/blocks')
    getBlockchain() {
        return this.blockchainService.getBlocks();
    }

    @Post('transactions')
    createTransaction(
        @Body()
        dto: CreateTransactionDto,
    ){
        return this.blockchainService.createTransaction(dto);
    }

    @Post('mine')
    mine (
        @Body()
        dto: MineDto,
    ){
        return this.blockchainService.mine(dto);
    }

    @Get('balance/:address')
    getBalance(
        @Param('address') address: string
    ) {
        return this.blockchainService.getBalance(address);
    }

    @Get('pending-transactions')
    getPendingTransactions(){
        return this.blockchainService.getPendingTransactions();
    }

    @Get('blocks/:index')
    getBlock(
        @Param('index', ParseIntPipe) index: number,
    ) {
        return this.blockchainService.getBlock(index);
    }

    @Get('wallets/:address/transactions')
    getTransactions(
        @Param('address') address: string,
    ){
        return this.blockchainService.getTransactions(address);
    }

    @Get('transaction/:hash')
    getTransaction(
        @Param('hash') hash: string,
    ) {
        return this.blockchainService.getTransaction(hash);
    }

    @Get('info')
    getInfo() {
        return this.blockchainService.getInfo();
    }

    @Get('validate')
    isvalid() {
        return this.blockchainService.validate();
    }
}

