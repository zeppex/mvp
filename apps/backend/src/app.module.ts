import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { MerchantsModule } from './merchants/merchants.module';

@Module({
  imports: [OrdersModule, MerchantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
