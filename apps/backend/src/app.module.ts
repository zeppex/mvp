import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ZeppexCoreModule } from './zeppex-core/zeppex-core.module';
import { ExchangeGwModule } from './exchange-gw/exchange-gw.module';
import { BinanceClientModule } from './binance-client/binance-client.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantModule } from './merchant/merchant.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'user',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'zeppex',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ZeppexCoreModule,
    ExchangeGwModule,
    BinanceClientModule,
    SharedModule,
    MerchantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
