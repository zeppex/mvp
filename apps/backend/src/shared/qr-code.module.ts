import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QrCodeService } from './services/qr-code.service';

@Module({
  imports: [ConfigModule],
  providers: [QrCodeService],
  exports: [QrCodeService],
})
export class QrCodeModule {}
