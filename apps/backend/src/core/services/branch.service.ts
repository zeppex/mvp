import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import { CreateBranchDto, UpdateBranchDto } from '../dto';
import { MerchantService } from './merchant.service';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
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

  async findAll(
    merchantId: string,
    includeDeactivated: boolean = false,
  ): Promise<Branch[]> {
    const whereClause: any = {
      merchant: { id: merchantId },
    };

    if (!includeDeactivated) {
      whereClause.isActive = true;
    }

    return this.branchRepository.find({
      where: whereClause,
      relations: ['merchant', 'pos'],
    });
  }

  async findOne(id: string, merchantId?: string): Promise<Branch> {
    const queryOptions: any = { where: { id } };

    if (merchantId) {
      queryOptions.where.merchant = { id: merchantId };
    }

    queryOptions.relations = ['merchant', 'pos'];

    const branch = await this.branchRepository.findOne(queryOptions);

    if (!branch) {
      throw new NotFoundException(`Branch ${id} not found`);
    }

    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    Object.assign(branch, updateBranchDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);

    if (!branch.isActive) {
      throw new ForbiddenException(`Branch ${id} is already deactivated`);
    }

    // Soft delete: deactivate the branch
    branch.deactivate();
    await this.branchRepository.save(branch);

    // Cascade: deactivate all POS under this branch
    if (branch.pos && branch.pos.length > 0) {
      for (const pos of branch.pos) {
        if (pos.isActive) {
          pos.deactivate();
          await this.branchRepository.manager.save(pos);
        }
        // Cascade: deactivate all payment orders for this POS
        const paymentOrders = await this.paymentOrderRepository.find({
          where: { pos: { id: pos.id }, deactivatedAt: null },
        });
        for (const order of paymentOrders) {
          if (!order.deactivatedAt) {
            order.deactivate();
            await this.paymentOrderRepository.save(order);
          }
        }
      }
    }
  }
}
