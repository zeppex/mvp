import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BinanceClientService {
  private readonly logger = new Logger(BinanceClientService.name);
  async createSubMerchant(merchantId: string): Promise<UUID> {
    const subMerchantId = uuidv4();
    this.logger.log(
      `Creating Binance sub-merchant for merchant ${merchantId} with ID ${subMerchantId}`,
    );
    Promise.resolve(subMerchantId);
    return subMerchantId as UUID;
  }
}
