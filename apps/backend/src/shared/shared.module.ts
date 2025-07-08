import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { MerchantModule } from '../merchant/merchant.module';
import { SeedService } from './services/seed.service';

@Module({
  imports: [ConfigModule, UserModule, MerchantModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SharedModule {}
