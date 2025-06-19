import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { CreateMerchantDto } from '../dto';
import { BinanceClientService } from '../../binance-client/binance-client.service';

@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);
  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly binanceClient: BinanceClientService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    const merchant = await this.merchantRepository.create({
      ...createMerchantDto,
    });
    const savedMerchant = await this.merchantRepository.save(merchant);

    this.logger.log(
      `Creating merchant with name ${createMerchantDto.name} - Merchant ID: ${savedMerchant.id}`,
    );
    return savedMerchant;
  }

  async findAll(): Promise<Merchant[]> {
    return this.merchantRepository.find();
  }

  async findOne(id: string): Promise<Merchant> {
    const merchant = await this.merchantRepository.findOne({
      where: { id },
    });
    if (!merchant) throw new NotFoundException(`Merchant ${id} not found`);
    return merchant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.merchantRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Merchant ${id} not found`);
  }

  async createBinanceSubMerchant(id: string): Promise<Merchant> {
    // ensure merchant exists
    const merchant = await this.findOne(id);
    // create Binance Pay sub-merchant
    const subId = await this.binanceClient.createSubMerchant(merchant.id);
    merchant.binanceId = subId;
    return this.merchantRepository.save(merchant);
  }
}
