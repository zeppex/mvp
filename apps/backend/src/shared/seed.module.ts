import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { CoreModule } from '../core/core.module';
import { TransactionModule } from '../transactions/transaction.module';
import { SeedService } from './services/seed.service';

@Module({
  imports: [ConfigModule, UserModule, CoreModule, TransactionModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
