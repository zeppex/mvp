import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeppexCoreModule } from './zeppex-core/zeppex-core.module';
import { ExchangeGwModule } from './exchange-gw/exchange-gw.module';
import { BinanceClientModule } from './binance-client/binance-client.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ZeppexCoreModule,
    ExchangeGwModule,
    BinanceClientModule,
    CqrsModule.forRoot(),
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
