import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentOrder } from '../entities/payment-order.entity';
import { CreatePaymentOrderDto } from '../dto';
import { BranchService } from './branch.service';
import { PosService } from './pos.service';
import { PaymentOrderStatus } from 'src/shared/enums/payment-order-status.enum';
import { UUID } from 'src/shared/types/uuid';

@Injectable()
export class PaymentOrderService {
  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepository: Repository<PaymentOrder>,
    private readonly branchService: BranchService,
    private readonly posService: PosService,
  ) {}

  async create(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    createDto: CreatePaymentOrderDto,
    tenantId?: UUID,
  ): Promise<PaymentOrder> {
    // Get branch and check tenant access
    const branch = await this.branchService.findOne(merchantId, branchId);

    // If tenantId is provided, verify access
    if (tenantId && branch.merchant.tenant?.id !== tenantId) {
      throw new ForbiddenException('You do not have access to this merchant');
    }

    await this.posService.findOne(merchantId, branchId, posId);

    const order = new PaymentOrder();
    order.amount = createDto.amount;
    order.description = createDto.description;
    order.branch = { id: branchId } as any;
    order.pos = { id: posId } as any;
    order.status = createDto.status ?? PaymentOrderStatus.ACTIVE;

    return this.orderRepository.save(order);
  }

  async findAll(
    merchantId: string,
    branchId: string,
    posId: string,
  ): Promise<PaymentOrder[]> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    return this.orderRepository.find({
      where: {
        pos: { id: posId },
      },
      relations: ['pos'],
    });
  }

  async findOne(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    const order = await this.orderRepository.findOne({
      where: {
        id,
        pos: { id: posId },
      },
      relations: ['pos'],
    });
    if (!order) throw new NotFoundException(`PaymentOrder ${id} not found`);
    return order;
  }

  async remove(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
  ): Promise<void> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    const result = await this.orderRepository.delete({
      id,
      pos: { id: posId },
    });
    if (result.affected === 0)
      throw new NotFoundException(`PaymentOrder ${id} not found`);
  }

  async getCurrent(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);

    const order = await this.orderRepository.findOne({
      where: {
        pos: { id: posId },
      },
      order: { createdAt: 'DESC' },
      relations: ['pos'],
    });
    if (!order || order.status !== PaymentOrderStatus.ACTIVE) {
      throw new NotFoundException(`No active order for pos: ${posId}`);
    }

    const now = new Date();
    const ageMs = now.getTime() - order.createdAt.getTime();
    if (ageMs > 2 * 60 * 1000) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      throw new NotFoundException(`No active order for pos: ${posId}`);
    }

    return order;
  }

  /**
   * Verifies if a payment order belongs to a specific tenant
   */
  async isPaymentOrderFromTenant(
    orderId: UUID,
    tenantId: UUID,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['branch', 'branch.merchant'],
    });

    if (!order) {
      throw new NotFoundException(`Payment order ${orderId} not found`);
    }

    return order.branch.merchant.tenant?.id === tenantId;
  }
}
