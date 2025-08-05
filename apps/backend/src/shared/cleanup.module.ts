import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoreModule } from '../core/core.module';
import { PaymentOrderCleanupService } from './services/payment-order-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot(), CoreModule],
  providers: [PaymentOrderCleanupService],
})
export class CleanupModule {}
