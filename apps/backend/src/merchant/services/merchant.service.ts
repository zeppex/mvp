import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { CreateMerchantDto } from '../dto';
import { UUID } from 'crypto';
import { BinanceClientService } from '../../binance-client/binance-client.service';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly binanceClient: BinanceClientService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const merchant = this.merchantRepository.create(createMerchantDto);
    return this.merchantRepository.save(merchant);
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find();
  }

  async findOne(id: UUID): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({ where: { id } });
    if (!merchant) throw new NotFoundException(`Merchant ${id} not found`);
    return merchant;
  }

  async remove(id: UUID): Promise<void> {
    const result = await this.merchantRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Merchant ${id} not found`);
  }

  async createBinanceSubMerchant(id: UUID): Promise<Merchant> {
    // ensure merchant exists
    const merchant = await this.findOne(id);
    // create Binance Pay sub-merchant
    const subId = await this.binanceClient.createSubMerchant(merchant.id);
    merchant.binanceId = subId;
    return this.merchantRepository.save(merchant);
  }
}
