import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentOrder } from '../entities/payment-order.entity';
import { CreatePaymentOrderDto, UpdatePaymentOrderDto } from '../dto';
import { BranchService } from './branch.service';
import { PosService } from './pos.service';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';
import { UUID } from 'src/shared/types/uuid';

@Injectable()
export class PaymentOrderService {
  private readonly logger = new Logger(PaymentOrderService.name);

  constructor(
    @InjectRepository(PaymentOrder)
    private readonly orderRepository: Repository<PaymentOrder>,
    private readonly branchService: BranchService,
    private readonly posService: PosService,
    private readonly configService: ConfigService,
  ) {}

  // Helper: get next queued order for a POS
  private async getNextQueuedOrder(posId: UUID): Promise<PaymentOrder | null> {
    return this.orderRepository.findOne({
      where: {
        pos: { id: posId },
        status: PaymentOrderStatus.QUEUED,
      },
      order: { createdAt: 'ASC' },
    });
  }

  // Helper: activate a queued order
  private async activateQueuedOrder(
    order: PaymentOrder,
  ): Promise<PaymentOrder> {
    order.status = PaymentOrderStatus.ACTIVE;
    // Set new TTL
    const ttlMs = this.configService.get<number>('PAYMENT_ORDER_TTL', 120000);
    order.expiresAt = new Date(Date.now() + ttlMs);
    return this.orderRepository.save(order);
  }

  async create(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    createDto: CreatePaymentOrderDto,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);
    // Check for existing ACTIVE order
    const activeOrder = await this.orderRepository.findOne({
      where: {
        pos: { id: posId },
        status: PaymentOrderStatus.ACTIVE,
      },
    });
    const order = new PaymentOrder();
    order.amount = createDto.amount;
    order.description = createDto.description;
    order.branch = { id: branchId } as any;
    order.pos = { id: posId } as any;
    if (activeOrder) {
      order.status = PaymentOrderStatus.QUEUED;
      order.expiresAt = null;
    } else {
      order.status = PaymentOrderStatus.ACTIVE;
      const ttlMs = this.configService.get<number>('PAYMENT_ORDER_TTL', 120000);
      order.expiresAt = new Date(Date.now() + ttlMs);
    }
    this.logger.log(
      `Creating payment order for POS ${posId} with status ${order.status}`,
    );
    return this.orderRepository.save(order);
  }

  async createByMerchant(
    merchantId: UUID,
    posId: UUID,
    createDto: CreatePaymentOrderDto,
  ): Promise<PaymentOrder> {
    const pos = await this.posService.findOneByMerchant(merchantId, posId);
    // Check for existing ACTIVE order
    const activeOrder = await this.orderRepository.findOne({
      where: {
        pos: { id: posId },
        status: PaymentOrderStatus.ACTIVE,
      },
    });
    const order = new PaymentOrder();
    order.amount = createDto.amount;
    order.description = createDto.description;
    order.branch = { id: pos.branch.id } as any;
    order.pos = { id: posId } as any;
    if (activeOrder) {
      order.status = PaymentOrderStatus.QUEUED;
      order.expiresAt = null;
    } else {
      order.status = PaymentOrderStatus.ACTIVE;
      const ttlMs = this.configService.get<number>('PAYMENT_ORDER_TTL', 120000);
      order.expiresAt = new Date(Date.now() + ttlMs);
    }
    this.logger.log(
      `Creating payment order for POS ${posId} with status ${order.status}`,
    );
    return this.orderRepository.save(order);
  }

  async findAll(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    includeDeactivated: boolean = false,
  ): Promise<PaymentOrder[]> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);

    const whereClause: any = {
      pos: { id: posId },
    };

    if (!includeDeactivated) {
      whereClause.deactivatedAt = null;
    }

    return this.orderRepository.find({
      where: whereClause,
      relations: ['pos'],
    });
  }

  async findAllByMerchant(
    merchantId: UUID,
    includeDeactivated: boolean = false,
  ): Promise<PaymentOrder[]> {
    const whereClause: any = {
      pos: { branch: { merchant: { id: merchantId } } },
    };

    if (!includeDeactivated) {
      whereClause.deactivatedAt = null;
    }

    return this.orderRepository.find({
      where: whereClause,
      relations: ['pos', 'pos.branch'],
    });
  }

  async findOne(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(branchId, merchantId);
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

  async findOneByMerchant(merchantId: UUID, id: UUID): Promise<PaymentOrder> {
    const order = await this.orderRepository.findOne({
      where: {
        id,
        pos: { branch: { merchant: { id: merchantId } } },
      },
      relations: ['pos', 'pos.branch'],
    });
    if (!order) throw new NotFoundException(`PaymentOrder ${id} not found`);
    return order;
  }

  async update(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
    updatePaymentOrderDto: UpdatePaymentOrderDto,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);

    const order = await this.findOne(merchantId, branchId, posId, id);

    Object.assign(order, updatePaymentOrderDto);
    return this.orderRepository.save(order);
  }

  async updateByMerchant(
    merchantId: UUID,
    id: UUID,
    updatePaymentOrderDto: UpdatePaymentOrderDto,
  ): Promise<PaymentOrder> {
    const order = await this.findOneByMerchant(merchantId, id);

    Object.assign(order, updatePaymentOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
  ): Promise<void> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);

    const order = await this.findOne(merchantId, branchId, posId, id);

    if (order.deactivatedAt) {
      throw new ForbiddenException(
        `Payment order ${id} is already deactivated`,
      );
    }

    // Soft delete: deactivate the payment order (sets status to CANCELLED if ACTIVE)
    order.deactivate();
    await this.orderRepository.save(order);
  }

  async removeByMerchant(merchantId: UUID, id: UUID): Promise<void> {
    const order = await this.findOneByMerchant(merchantId, id);

    if (order.deactivatedAt) {
      throw new ForbiddenException(
        `Payment order ${id} is already deactivated`,
      );
    }

    // Soft delete: deactivate the payment order (sets status to CANCELLED if ACTIVE)
    order.deactivate();
    await this.orderRepository.save(order);
  }

  async getCurrent(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);

    const order = await this.orderRepository.findOne({
      where: {
        pos: { id: posId },
        status: PaymentOrderStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
      relations: ['pos'],
    });

    if (!order) {
      throw new NotFoundException(`No active order for pos: ${posId}`);
    }

    // Check if order has expired
    if (order.isExpired()) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      this.logger.log(
        `Payment order ${order.id} expired and was marked as EXPIRED`,
      );
      throw new NotFoundException(`No active order for pos: ${posId}`);
    }

    return order;
  }

  async getCurrentByMerchant(
    merchantId: UUID,
    posId: UUID,
  ): Promise<PaymentOrder> {
    await this.posService.findOneByMerchant(merchantId, posId);
    let order = await this.orderRepository.findOne({
      where: {
        pos: { id: posId },
        status: PaymentOrderStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
      relations: ['pos'],
    });
    
    if (order && order.isExpired()) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      this.logger.log(
        `Payment order ${order.id} expired and was marked as EXPIRED`,
      );
      // Promote next queued order
      const next = await this.getNextQueuedOrder(posId);
      if (next) {
        order = await this.activateQueuedOrder(next);
        this.logger.log(`Promoted queued order ${order.id} to ACTIVE`);
      } else {
        throw new NotFoundException(`No active order for pos: ${posId}`);
      }
    }
    
    if (!order) {
      // No active order, try to promote next queued order
      const next = await this.getNextQueuedOrder(posId);
      if (next) {
        order = await this.activateQueuedOrder(next);
        this.logger.log(`Promoted queued order ${order.id} to ACTIVE`);
      } else {
        throw new NotFoundException(`No active order for pos: ${posId}`);
      }
    }
    
    // Final check: if the order is still expired (shouldn't happen but just in case)
    if (order && order.isExpired()) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      this.logger.log(
        `Payment order ${order.id} expired and was marked as EXPIRED`,
      );
      throw new NotFoundException(`No active order for pos: ${posId}`);
    }
    
    return order;
  }

  async triggerInProgress(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    orderId: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(branchId, merchantId);
    await this.posService.findOne(merchantId, branchId, posId);

    const order = await this.findOne(merchantId, branchId, posId, orderId);

    // Check if order is in a valid state to be processed
    if (order.status !== PaymentOrderStatus.ACTIVE) {
      throw new ForbiddenException(
        `Cannot process order with status: ${order.status}. Only ACTIVE orders can be processed.`,
      );
    }

    // Check if order has expired
    if (order.isExpired()) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      this.logger.log(
        `Payment order ${order.id} expired and was marked as EXPIRED`,
      );
      throw new ForbiddenException(
        'Payment order has expired and cannot be processed.',
      );
    }

    // Update status to IN_PROGRESS
    order.status = PaymentOrderStatus.IN_PROGRESS;
    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(`Payment order ${order.id} status changed to IN_PROGRESS`);

    return updatedOrder;
  }

  async triggerInProgressByMerchant(
    merchantId: UUID,
    orderId: UUID,
  ): Promise<PaymentOrder> {
    const order = await this.findOneByMerchant(merchantId, orderId);

    // Check if order is in a valid state to be processed
    if (order.status !== PaymentOrderStatus.ACTIVE) {
      throw new ForbiddenException(
        `Cannot process order with status: ${order.status}. Only ACTIVE orders can be processed.`,
      );
    }

    // Check if order has expired
    if (order.isExpired()) {
      order.status = PaymentOrderStatus.EXPIRED;
      await this.orderRepository.save(order);
      this.logger.log(
        `Payment order ${order.id} expired and was marked as EXPIRED`,
      );
      throw new ForbiddenException(
        'Payment order has expired and cannot be processed.',
      );
    }

    // Update status to IN_PROGRESS
    order.status = PaymentOrderStatus.IN_PROGRESS;
    const updatedOrder = await this.orderRepository.save(order);

    this.logger.log(`Payment order ${order.id} status changed to IN_PROGRESS`);

    return updatedOrder;
  }

  async cancelExpiredOrders(): Promise<number> {
    const expiredOrders = await this.orderRepository.find({
      where: {
        status: PaymentOrderStatus.ACTIVE,
      },
    });

    let cancelledCount = 0;
    for (const order of expiredOrders) {
      if (order.shouldBeCancelled()) {
        order.status = PaymentOrderStatus.EXPIRED;
        await this.orderRepository.save(order);
        cancelledCount++;
        this.logger.log(`Cancelled expired payment order: ${order.id}`);
      }
    }

    if (cancelledCount > 0) {
      this.logger.log(`Cancelled ${cancelledCount} expired payment orders`);
    }

    return cancelledCount;
  }

  async updateOrderStatus(
    merchantId: UUID,
    orderId: UUID,
    status: PaymentOrderStatus,
  ): Promise<PaymentOrder> {
    const order = await this.findOneByMerchant(merchantId, orderId);
    order.status = status;
    await this.orderRepository.save(order);
    return order;
  }
}
