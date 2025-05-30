import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';
import { Merchant } from './merchant.entity';
import { Branch } from './branch.entity';
import { Pos } from './pos.entity';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { PosService } from './pos.service';
import { PosController } from './pos.controller';
import { BinanceClientModule } from '../binance-client/binance-client.module';
import { MerchantSubscriber } from './merchant.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, Branch, Pos]), BinanceClientModule],
  providers: [MerchantService, BranchService, PosService, MerchantSubscriber],
  controllers: [MerchantController, BranchController, PosController],
  exports: [MerchantService, BranchService, PosService],
})
export class MerchantModule {}
