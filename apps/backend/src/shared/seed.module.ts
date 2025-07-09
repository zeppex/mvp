import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './services/seed.service';
import { UserModule } from '../user/user.module';
import { MerchantModule } from '../merchant/merchant.module';

@Module({
  imports: [ConfigModule, UserModule, MerchantModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
