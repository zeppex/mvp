import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { CoreModule } from '../core/core.module';
import { SeedService } from './services/seed.service';

@Module({
  imports: [ConfigModule, UserModule, CoreModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
