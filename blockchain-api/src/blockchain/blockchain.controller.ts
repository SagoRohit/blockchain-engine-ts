import { Controller, Get } from '@nestjs/common';

@Controller('blockchain')
export class BlockchainController {
    @Get()
    getBlockchain(): string {
        return "Blockchain Controller works!";
    }
}
