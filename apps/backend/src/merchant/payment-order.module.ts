import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrder } from './entities/payment-order.entity';
import { PaymentOrderService } from './services/payment-order.service';
import { PaymentOrderController } from './controllers/payment-order.controller';
import { MerchantModule } from './merchant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentOrder]),
    forwardRef(() => MerchantModule),
  ],
  providers: [PaymentOrderService],
  controllers: [PaymentOrderController],
  exports: [PaymentOrderService],
})
export class PaymentOrderModule {}
