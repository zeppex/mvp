import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto } from '../dto';
import { MerchantService } from './merchant.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly merchantService: MerchantService,
  ) {}

  async create(
    merchantId: string,
    createBranchDto: CreateBranchDto,
  ): Promise<Branch> {
    // ensure merchant exists
    const merchant = await this.merchantService.findOne(merchantId);

    const branch = this.branchRepository.create({
      ...createBranchDto,
      merchant: { id: merchantId } as any,
    });
    return this.branchRepository.save(branch);
  }

  async findAll(merchantId: string): Promise<Branch[]> {
    return this.branchRepository.find({
      where: {
        merchant: { id: merchantId },
      },
      relations: ['merchant'],
    });
  }

  async findOne(id: string, merchantId?: string): Promise<Branch> {
    const queryOptions: any = { where: { id } };

    if (merchantId) {
      queryOptions.where.merchant = { id: merchantId };
    }

    queryOptions.relations = ['merchant'];

    const branch = await this.branchRepository.findOne(queryOptions);

    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }

    return branch;
  }

  async remove(id: string): Promise<void> {
    const result = await this.branchRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
  }
}
