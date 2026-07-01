import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';

@Module({
  controllers: [BlockchainController]
})
export class BlockchainModule {}
