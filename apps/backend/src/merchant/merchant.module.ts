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

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, Branch, Pos])],
  providers: [MerchantService, BranchService, PosService],
  controllers: [MerchantController, BranchController, PosController],
})
export class MerchantModule {}
