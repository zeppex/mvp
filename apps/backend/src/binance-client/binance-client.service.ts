import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class BinanceClientService {
  async createSubMerchant(merchantId: string): Promise<string> {
    // TODO: integrate with Binance Pay API to register sub-merchant
    return uuidv7();
  }
}
