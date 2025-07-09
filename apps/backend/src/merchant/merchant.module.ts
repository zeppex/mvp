import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Merchant } from './entities/merchant.entity';
import { MerchantService } from './services/merchant.service';
import { MerchantController } from './controllers/merchant.controller';
import { BinanceClientModule } from '../binance-client/binance-client.module';
import { BranchService } from './services/branch.service';
import { Branch } from './entities/branch.entity';
import { BranchController } from './controllers/branch.controller';
import { PosService } from './services/pos.service';
import { Pos } from './entities/pos.entity';
import { PosController } from './controllers/pos.controller';
import { PaymentOrderService } from './services/payment-order.service';
import { PaymentOrder } from './entities/payment-order.entity';
import { PaymentOrderController } from './controllers/payment-order.controller';
import { PublicPaymentOrderController } from './controllers/public-payment-order.controller';
import { AuthModule } from '../auth/auth.module';
import { QrCodeModule } from '../shared/qr-code.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Merchant, Branch, Pos, PaymentOrder]),
    BinanceClientModule,
    AuthModule,
    QrCodeModule,
  ],
  providers: [MerchantService, BranchService, PosService, PaymentOrderService],
  controllers: [
    MerchantController,
    BranchController,
    PosController,
    PaymentOrderController,
    PublicPaymentOrderController,
  ],
  exports: [MerchantService, BranchService, PosService, PaymentOrderService],
})
export class MerchantModule {}
