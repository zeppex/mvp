import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto } from '../dto';
import { UUID } from 'crypto';
import { MerchantService } from './merchant.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly merchantService: MerchantService,
  ) {}

  async create(
    merchantId: UUID,
    createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    // ensure merchant exists
    await this.merchantService.findOne(merchantId);
    const branch = this.branchRepository.create({
      ...createBranchDto,
      merchantId,
    });
    return this.branchRepository.save(branch);
  }

  async findAll(merchantId: string): Promise<Branch[]> {
    return this.branchRepository.find({ where: { merchantId } });
  }

  async findOne(merchantId: string, id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id, merchantId },
    });
    if (!branch)
      throw new NotFoundException(
        `Branch ${id} not found for merchant ${merchantId}`,
      );
    return branch;
  }

  async remove(merchantId: string, id: string): Promise<void> {
    const result = await this.branchRepository.delete({ id, merchantId });
    if (result.affected === 0)
      throw new NotFoundException(
        `Branch ${id} not found for merchant ${merchantId}`,
      );
  }
}
