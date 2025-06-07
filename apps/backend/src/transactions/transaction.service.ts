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

  async create(
    dto: CreateTransactionDto,
    tenantId?: UUID,
  ): Promise<Transaction> {
    const { merchantId, branchId, posId, ...rest } = dto;

    // Get the merchant to check tenant access
    const merchant = await this.merchantService.findOne(merchantId);

    // If tenantId is provided, verify access
    if (tenantId && merchant.tenant?.id !== tenantId) {
      throw new ForbiddenException('You do not have access to this merchant');
    }

    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);

    const transaction = this.transactionRepository.create({
      ...rest,
      merchant: { id: merchantId } as any,
      branch: { id: branchId } as any,
      pos: { id: posId } as any,
      // Set the tenant from the merchant
      tenant: { id: merchant.tenant?.id } as any,
    });

    return this.transactionRepository.save(transaction);
  }

  async findAll(tenantId?: UUID): Promise<Transaction[]> {
    // If a tenantId is provided, only return transactions for that tenant
    if (tenantId) {
      return this.transactionRepository.find({
        where: {
          tenant: { id: tenantId },
        },
        relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'tenant'],
      });
    }

    // Otherwise return all transactions (admin access)
    return this.transactionRepository.find({
      relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'tenant'],
    });
  }

  async findOne(id: UUID, tenantId?: UUID): Promise<Transaction> {
    // Create the where condition based on whether tenantId is provided
    const where = tenantId ? { id, tenant: { id: tenantId } } : { id };

    const transaction = await this.transactionRepository.findOne({
      where,
      relations: ['merchant', 'branch', 'pos', 'paymentOrder', 'tenant'],
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }

    return transaction;
  }

  async remove(id: UUID, tenantId?: UUID): Promise<void> {
    // If tenantId is provided, verify the transaction belongs to that tenant
    if (tenantId) {
      const transaction = await this.findOne(id, tenantId);
      if (transaction.tenant?.id !== tenantId) {
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
