import { Module } from '@nestjs/common';
import { BinanceClientService } from './binance-client.service';

@Module({
  providers: [BinanceClientService],
  exports: [BinanceClientService],
})
export class BinanceClientModule {}
