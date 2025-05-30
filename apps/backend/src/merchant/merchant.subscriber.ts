import { Injectable } from '@nestjs/common';
import {
  EventSubscriber,
  EntitySubscriberInterface,
  InsertEvent,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { BinanceClientService } from '../binance-client/binance-client.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@EventSubscriber()
@Injectable()
export class MerchantSubscriber implements EntitySubscriberInterface<Merchant> {
  constructor(
    private readonly binanceClient: BinanceClientService,
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
  ) {}

  listenTo() {
    return Merchant;
  }

  async afterInsert(event: InsertEvent<Merchant>): Promise<void> {
    const merchant = event.entity;
    if (!merchant) return;
    const subId = await this.binanceClient.createSubMerchant(merchant.id);
    await this.merchantRepository.update(merchant.id, { binanceId: subId });
  }
}
