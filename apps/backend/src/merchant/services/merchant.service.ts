import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Merchant } from '../entities/merchant.entity';
import { CreateMerchantDto, UpdateMerchantDto } from '../dto';
import { BinanceClientService } from '../../binance-client/binance-client.service';
import { Exception, CommonErrors } from '../../shared/errors/exceptions';

@Injectable()
export class MerchantService {
  private readonly logger = new Logger(MerchantService.name);

  constructor(
    @InjectRepository(Merchant)
    private readonly merchantRepository: Repository<Merchant>,
    private readonly binanceClient: BinanceClientService,
  ) {}

  async create(createMerchantDto: CreateMerchantDto): Promise<Merchant> {
    this.logger.log(`Creating merchant: ${createMerchantDto.name}`);

    try {
      // Check if merchant with same contact email already exists
      const existingMerchant = await this.merchantRepository.findOne({
        where: { contact: createMerchantDto.contact },
      });

      if (existingMerchant) {
        throw new Exception(CommonErrors.CONFLICT, {
          reason: `Merchant with contact email ${createMerchantDto.contact} already exists`,
        });
      }

      const merchant = this.merchantRepository.create({
        ...createMerchantDto,
        isActive: true,
      });

      const savedMerchant = await this.merchantRepository.save(merchant);

      this.logger.log(`Merchant created successfully: ${savedMerchant.id}`);
      return savedMerchant;
    } catch (error) {
      this.logger.error(
        `Failed to create merchant: ${error.message}`,
        error.stack,
      );

      if (error instanceof Exception) {
        throw error;
      }

      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async findAll(): Promise<Merchant[]> {
    try {
      const merchants = await this.merchantRepository.find({
        order: { createdAt: 'DESC' },
      });

      this.logger.log(`Retrieved ${merchants.length} merchants`);
      return merchants;
    } catch (error) {
      this.logger.error(
        `Failed to retrieve merchants: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async findOne(id: string): Promise<Merchant> {
    try {
      const merchant = await this.merchantRepository.findOne({
        where: { id },
        relations: ['branches'],
      });

      if (!merchant) {
        throw new Exception(CommonErrors.RESOURCE_NOT_FOUND, { id });
      }

      this.logger.log(`Retrieved merchant: ${id}`);
      return merchant;
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }

      this.logger.error(
        `Failed to retrieve merchant ${id}: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async update(id: string, updateData: UpdateMerchantDto): Promise<Merchant> {
    try {
      const merchant = await this.findOne(id);

      // Check if contact email is being changed and if it conflicts
      if (updateData.contact && updateData.contact !== merchant.contact) {
        const existingMerchant = await this.merchantRepository.findOne({
          where: { contact: updateData.contact },
        });

        if (existingMerchant && existingMerchant.id !== id) {
          throw new Exception(CommonErrors.CONFLICT, {
            reason: `Merchant with contact email ${updateData.contact} already exists`,
          });
        }
      }

      Object.assign(merchant, updateData);
      const updatedMerchant = await this.merchantRepository.save(merchant);

      this.logger.log(`Merchant updated successfully: ${id}`);
      return updatedMerchant;
    } catch (error) {
      if (error instanceof Exception) {
        throw error;
      }

      this.logger.error(
        `Failed to update merchant ${id}: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const merchant = await this.findOne(id);

      // Check if merchant has active branches
      if (merchant.branches && merchant.branches.length > 0) {
        throw new BadRequestException(
          'Cannot delete merchant with active branches',
        );
      }

      const result = await this.merchantRepository.delete(id);

      if (result.affected === 0) {
        throw new Exception(CommonErrors.RESOURCE_NOT_FOUND, { id });
      }

      this.logger.log(`Merchant deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof Exception || error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error(
        `Failed to delete merchant ${id}: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async createBinanceSubMerchant(id: string): Promise<Merchant> {
    try {
      const merchant = await this.findOne(id);

      if (merchant.binanceId) {
        throw new ConflictException(
          'Merchant already has a Binance sub-merchant ID',
        );
      }

      // Create Binance Pay sub-merchant
      const subId = await this.binanceClient.createSubMerchant(merchant.id);
      merchant.binanceId = subId;

      const updatedMerchant = await this.merchantRepository.save(merchant);

      this.logger.log(`Binance sub-merchant created for merchant: ${id}`);
      return updatedMerchant;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      this.logger.error(
        `Failed to create Binance sub-merchant for ${id}: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }

  async findByContact(contact: string): Promise<Merchant | null> {
    try {
      return await this.merchantRepository.findOne({
        where: { contact },
      });
    } catch (error) {
      this.logger.error(
        `Failed to find merchant by contact ${contact}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async getActiveMerchants(): Promise<Merchant[]> {
    try {
      return await this.merchantRepository.find({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get active merchants: ${error.message}`,
        error.stack,
      );
      throw new Exception(CommonErrors.INTERNAL_ERROR);
    }
  }
}
