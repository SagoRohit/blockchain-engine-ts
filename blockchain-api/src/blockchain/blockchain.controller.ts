import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

}

