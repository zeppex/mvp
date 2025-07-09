import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentOrderCleanupService } from './services/payment-order-cleanup.service';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [ScheduleModule.forRoot(), MerchantModule],
  providers: [PaymentOrderCleanupService],
  exports: [PaymentOrderCleanupService],
})
export class CleanupModule {}
