import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';
import { WalletModule } from './wallet/wallet.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { WatchlistModule } from './watchlist/watchlist.module';

@Module({ // decorator, metadata that tells nestjs how to build the application
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    BlockchainModule,
    WalletModule,
    WatchlistModule,
  ], // what other module does this module depend on
  controllers: [AppController], // these controllers belong to this module
  providers: [AppService], // These classes can be created and injected where needed.
})
export class AppModule {}
// appmodule is like a map
// a container that groups everything realted to the feature