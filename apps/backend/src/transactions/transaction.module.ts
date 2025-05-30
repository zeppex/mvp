import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './transaction.entity';
import { MerchantModule } from '../merchant/merchant.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';


@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), MerchantModule],
  providers: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
