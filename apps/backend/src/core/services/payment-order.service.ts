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

  // Helper: complete payment order and mint tokens
  private async completePaymentOrder(
    order: PaymentOrder,
  ): Promise<PaymentOrder> {
    order.status = PaymentOrderStatus.COMPLETED;
    order.completedAt = new Date();

    const savedOrder = await this.orderRepository.save(order);

    // Mint Zeppex tokens to the branch based on payment amount
    try {
      const tokenAmount = this.calculateTokenAmount(order.amount);
      await this.branchService.mintTokensToBranch(
        order.branch.id,
        tokenAmount,
        `Payment completion for order ${order.id}`,
      );

      this.logger.log(
        `Minted ${tokenAmount} ZEPPEX tokens to branch ${order.branch.id} for payment order ${order.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to mint tokens for payment order ${order.id}: ${error.message}`,
      );
      // Don't fail the payment completion if token minting fails
    }

    return savedOrder;
  }

  // Helper: calculate token amount based on payment amount
  private calculateTokenAmount(paymentAmount: string): number {
    // Convert payment amount to tokens (1:1 ratio for now, can be adjusted)
    // Assuming payment amount is in cents, convert to tokens
    const amountInCents = parseFloat(paymentAmount);
    return Math.floor(amountInCents / 100); // 1 token per dollar
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

    // Handle case where pos.branch might be null due to merchant relationship issues
    if (!pos.branch || !pos.branch.id) {
      // Try to get branch ID from the POS directly
      const posWithBranch = await this.posService.findOneByPosId(posId);
      if (!posWithBranch.branch || !posWithBranch.branch.id) {
        throw new Error(`Cannot determine branch ID for POS ${posId}`);
      }
      order.branch = { id: posWithBranch.branch.id } as any;
    } else {
      order.branch = { id: pos.branch.id } as any;
    }

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
    let orders = await this.orderRepository.find({
      where: {
        pos: { branch: { merchant: { id: merchantId } } },
        ...(includeDeactivated ? {} : { deactivatedAt: null }),
      },
      relations: ['pos', 'pos.branch'],
    });

    // If no orders found with merchant filter, try without it (for superadmin)
    if (orders.length === 0) {
        orders = await this.orderRepository.find({
          where: {
            ...(includeDeactivated ? {} : { deactivatedAt: null }),
          },
          relations: ['pos', 'pos.branch'],
        });
      }

      return orders;
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
    let order = await this.orderRepository.findOne({
      where: {
        id,
        pos: { branch: { merchant: { id: merchantId } } },
      },
      relations: ['pos', 'pos.branch'],
    });

    // If order not found with merchant filter, try without it (for superadmin)
    if (!order) {
      order = await this.orderRepository.findOne({
        where: { id },
        relations: ['pos', 'pos.branch'],
      });
    }

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
    try {
      await this.posService.findOneByMerchant(merchantId, posId);
    } catch (error) {
      // If POS not found with merchant filter, try without it (for superadmin)
      await this.posService.findOneByPosId(posId); // Try without merchant filter
    }
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

    if (order.status === PaymentOrderStatus.COMPLETED) {
      throw new ForbiddenException('Cannot update completed order');
    }

    if (order.status === PaymentOrderStatus.CANCELLED) {
      throw new ForbiddenException('Cannot update cancelled order');
    }

    if (order.status === PaymentOrderStatus.EXPIRED) {
      throw new ForbiddenException('Cannot update expired order');
    }

    order.status = status;

    if (status === PaymentOrderStatus.COMPLETED) {
      return this.completePaymentOrder(order);
    }

    return this.orderRepository.save(order);
  }

  async completePayment(
    merchantId: UUID,
    orderId: UUID,
  ): Promise<PaymentOrder> {
    return this.updateOrderStatus(
      merchantId,
      orderId,
      PaymentOrderStatus.COMPLETED,
    );
  }

  async completePaymentByBranch(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    orderId: UUID,
  ): Promise<PaymentOrder> {
    const order = await this.findOne(merchantId, branchId, posId, orderId);

    if (order.status === PaymentOrderStatus.COMPLETED) {
      throw new ForbiddenException('Order is already completed');
    }

    if (order.status === PaymentOrderStatus.CANCELLED) {
      throw new ForbiddenException('Cannot complete cancelled order');
    }

    if (order.status === PaymentOrderStatus.EXPIRED) {
      throw new ForbiddenException('Cannot complete expired order');
    }

    return this.completePaymentOrder(order);
  }
}
