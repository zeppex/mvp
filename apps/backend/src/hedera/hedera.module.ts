import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HederaService } from './hedera.service';
import { TokenService } from './token.service';
import { AccountService } from './account.service';
import { TokenInitService } from './token-init.service';

@Module({
  imports: [ConfigModule],
  providers: [HederaService, TokenService, AccountService, TokenInitService],
  exports: [HederaService, TokenService, AccountService, TokenInitService],
})
export class HederaModule {}
