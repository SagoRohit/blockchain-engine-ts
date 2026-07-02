import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({ // decorator, metadata that tells nestjs how to build the application
  imports: [BlockchainModule], // what other module does this module depend on
  controllers: [AppController], // these controllers belong to this module
  providers: [AppService], // These classes can be created and injected where needed.
})
export class AppModule {}
// appmodule is like a map
// a container that groups everything realted to the feature