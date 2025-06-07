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
    tenantId?: string,
  ): Promise<Branch> {
    // ensure merchant exists and check tenant access
    const merchant = await this.merchantService.findOne(merchantId);

    // If tenantId is provided, verify access
    if (tenantId && merchant.tenant?.id !== tenantId) {
      throw new ForbiddenException('You do not have access to this merchant');
    }

    const branch = this.branchRepository.create({
      ...createBranchDto,
      merchant: { id: merchantId } as any,
    });
    return this.branchRepository.save(branch);
  }

  async findAll(merchantId: string, tenantId?: string): Promise<Branch[]> {
    // If tenantId is provided, verify tenant access to this merchant
    if (tenantId) {
      const merchant = await this.merchantService.findOne(merchantId);
      if (merchant.tenant?.id !== tenantId) {
        throw new ForbiddenException('You do not have access to this merchant');
      }
    }

    return this.branchRepository.find({
      where: {
        merchant: { id: merchantId },
      },
      relations: ['merchant'],
    });
  }

  async findOne(
    id: string,
    merchantId?: string,
    tenantId?: string,
  ): Promise<Branch> {
    const queryOptions: any = { where: { id } };

    if (merchantId) {
      queryOptions.where.merchant = { id: merchantId };
    }

    queryOptions.relations = ['merchant'];

    const branch = await this.branchRepository.findOne(queryOptions);

    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }

    // If tenantId is provided, verify tenant access
    if (tenantId && branch.merchant.tenant?.id !== tenantId) {
      throw new ForbiddenException('You do not have access to this branch');
    }

    return branch;
  }

  async remove(id: string, tenantId?: string): Promise<void> {
    // Verify tenant access if tenantId is provided
    if (tenantId) {
      const branch = await this.findOne(id, undefined, tenantId);
    }

    const result = await this.branchRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Branch ${id} not found`);
    }
  }

  /**
   * Verifies if a merchant belongs to the specified tenant
   */
  async isMerchantFromTenant(
    merchantId: string,
    tenantId: string,
  ): Promise<boolean> {
    const merchant = await this.merchantService.findOne(merchantId);
    return merchant.tenant?.id === tenantId;
  }

  /**
   * Verifies if a branch belongs to the specified tenant
   */
  async isBranchFromTenant(
    branchId: string,
    tenantId: string,
  ): Promise<boolean> {
    const branch = await this.findOne(branchId);
    return branch.merchant.tenant?.id === tenantId;
  }
}
