import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto';
import { MerchantService } from '../merchant/services/merchant.service';
import { BranchService } from '../merchant/services/branch.service';
import { PosService } from '../merchant/services/pos.service';
import { UUID } from '../shared/types/uuid';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly merchantService: MerchantService,
    private readonly branchService: BranchService,
    private readonly posService: PosService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const { merchantId, branchId, posId, ...rest } = dto;

    // Verify the merchant exists
    const merchant = await this.merchantService.findOne(merchantId);

    // Verify the branch exists and belongs to the merchant
    await this.branchService.findOne(branchId, merchantId);

    // Verify the POS exists and belongs to the branch
    await this.posService.findOne(merchantId, branchId, posId);

    const transaction = this.transactionRepository.create({
      ...rest,
      merchant: { id: merchantId } as any,
      branch: { id: branchId } as any,
      pos: { id: posId } as any,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(merchantId?: UUID): Promise<Transaction[]> {
    // If a merchantId is provided, only return transactions for that merchant
    if (merchantId) {
      return this.transactionRepository.find({
        where: {
          merchant: { id: merchantId },
        },
        relations: ['merchant', 'branch', 'pos', 'paymentOrder'],
      });
    }

    // Otherwise return all transactions (superadmin access)
    return this.transactionRepository.find({
      relations: ['merchant', 'branch', 'pos', 'paymentOrder'],
    });
  }

  async findOne(id: UUID, merchantId?: UUID): Promise<Transaction> {
    // Create the where condition based on whether merchantId is provided
    const where = merchantId ? { id, merchant: { id: merchantId } } : { id };

    const transaction = await this.transactionRepository.findOne({
      where,
      relations: ['merchant', 'branch', 'pos', 'paymentOrder'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async remove(id: UUID, merchantId?: UUID): Promise<void> {
    // If merchantId is provided, verify the transaction belongs to that merchant
    if (merchantId) {
      const transaction = await this.findOne(id, merchantId);
      if (transaction.merchant?.id !== merchantId) {
        throw new ForbiddenException(
          'You do not have access to this transaction',
        );
      }
    }

    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
  }
}
