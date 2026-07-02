import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [WalletModule],
  controllers: [BlockchainController],
  providers: [BlockchainService]
})
export class BlockchainModule {}
