import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { CreateTransactionDto } from './dto';
import { MerchantService } from '../merchant/services/merchant.service';
import { BranchService } from '../merchant/services/branch.service';
import { PosService } from '../merchant/services/pos.service';

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
    await this.merchantService.findOne(merchantId);
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    const transaction = this.transactionRepository.create({
      ...rest,
      merchantId,
      branchId,
      posId,
    });
    return this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });
    if (!transaction)
      throw new NotFoundException(`Transaction ${id} not found`);
    return transaction;
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Transaction ${id} not found`);
  }
}
