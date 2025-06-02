import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { SeedService } from './services/seed.service';

@Module({
  imports: [ConfigModule, TenantModule, UserModule],
  providers: [SeedService],
})
export class SharedModule {}
