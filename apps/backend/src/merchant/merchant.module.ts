import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantService } from './services/merchant.service';
import { MerchantController } from './controllers/merchant.controller';
import { Merchant } from './entities/merchant.entity';
import { Branch } from './entities/branch.entity';
import { Pos } from './entities/pos.entity';
import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { PosService } from './services/pos.service';
import { PosController } from './controllers/pos.controller';
import { BinanceClientModule } from '../binance-client/binance-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, Branch, Pos]), BinanceClientModule],
  providers: [MerchantService, BranchService, PosService],
  controllers: [MerchantController, BranchController, PosController],
  exports: [MerchantService, BranchService, PosService],
})
export class MerchantModule {}
