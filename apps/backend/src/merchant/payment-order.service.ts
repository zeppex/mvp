import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentOrder } from './payment-order.entity';
import { CreatePaymentOrderDto } from './dto';
import { BranchService } from './branch.service';
import { PosService } from './pos.service';
import { UUID } from 'crypto';

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
  ): Promise<PaymentOrder> {
    // validate branch and pos hierarchy
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    const order = this.orderRepository.create({
      ...createDto,
      branchId,
      posId,
    });
    return this.orderRepository.save(order);
  }

  async findAll(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
  ): Promise<PaymentOrder[]> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    return this.orderRepository.find({ where: { posId } });
  }

  async findOne(
    merchantId: UUID,
    branchId: UUID,
    posId: UUID,
    id: UUID,
  ): Promise<PaymentOrder> {
    await this.branchService.findOne(merchantId, branchId);
    await this.posService.findOne(merchantId, branchId, posId);
    const order = await this.orderRepository.findOne({ where: { id, posId } });
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
    const result = await this.orderRepository.delete({ id, posId });
    if (result.affected === 0)
      throw new NotFoundException(`PaymentOrder ${id} not found`);
  }
}
