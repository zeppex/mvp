import { Injectable, Logger } from '@nestjs/common';
import { UUID } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class BinanceClientService {
    private readonly logger = new Logger(BinanceClientService.name);
  async createSubMerchant(merchantId: string): Promise<UUID> {
    const subMerchantId = uuidv7();
    this.logger.log(`Creating Binance sub-merchant for merchant ${merchantId} with ID ${subMerchantId}`);
    Promise.resolve(subMerchantId); 
    return subMerchantId as UUID;
  }
}
