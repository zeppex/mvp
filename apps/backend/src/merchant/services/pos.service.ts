import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pos } from '../entities/pos.entity';
import { PaymentOrder } from '../entities/payment-order.entity';
import { CreatePosDto, UpdatePosDto } from '../dto';
import { BranchService } from './branch.service';
import { QrCodeService } from '../../shared/services/qr-code.service';
import { UUID } from 'src/shared/types/uuid';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

@Injectable()
export class PosService {
  private readonly logger = new Logger(PosService.name);
  constructor(
    @InjectRepository(Pos)
    private readonly posRepository: Repository<Pos>,
    @InjectRepository(PaymentOrder)
    private readonly paymentOrderRepository: Repository<PaymentOrder>,
    private readonly branchService: BranchService,
    private readonly qrCodeService: QrCodeService,
  ) {}

  async create(
    merchantId: UUID,
    branchId: UUID,
    createPosDto: CreatePosDto,
  ): Promise<Pos> {
    // ensure branch exists under merchant
    await this.branchService.findOne(branchId, merchantId);

    const pos = this.posRepository.create({
      ...createPosDto,
      branch: { id: branchId } as any,
    });

    // Generate QR code for the POS
    const qrCode = this.qrCodeService.generatePosQrCode(
      merchantId,
      branchId,
      pos.id,
    );
    pos.qrCode = qrCode.url;

    const savedPos = await this.posRepository.save(pos);

    this.logger.log(`Created POS ${savedPos.id} with QR code: ${pos.qrCode}`);

    return savedPos;
  }

  async findAll(
    merchantId: UUID,
    branchId: UUID,
    includeDeactivated: boolean = false,
  ): Promise<Pos[]> {
    // ensure branch exists
    try {
      await this.branchService.findOne(branchId, merchantId);

      const whereClause: any = {
        branch: { id: branchId },
      };

      if (!includeDeactivated) {
        whereClause.isActive = true;
      }

      return this.posRepository.find({
        where: whereClause,
        relations: ['branch'],
      });
    } catch (error) {
      this.logger.error(
        `Error fetching POS for merchant ${merchantId}, branch ${branchId}: ${error.message}`,
        error.stack,
      );
      throw new NotFoundException(
        `Branch ${branchId} not found for merchant ${merchantId}`,
      );
    }
  }

  async findOne(merchantId: UUID, branchId: UUID, id: UUID): Promise<Pos> {
    await this.branchService.findOne(branchId, merchantId);
    const pos = await this.posRepository.findOne({
      where: {
        id,
        branch: { id: branchId },
      },
      relations: ['branch'],
    });
    if (!pos)
      throw new NotFoundException(`POS ${id} not found for branch ${branchId}`);
    return pos;
  }

  async findOneByMerchant(merchantId: UUID, id: UUID): Promise<Pos> {
    const pos = await this.posRepository.findOne({
      where: {
        id,
        branch: { merchant: { id: merchantId } },
      },
      relations: ['branch', 'branch.merchant'],
    });
    if (!pos)
      throw new NotFoundException(
        `POS ${id} not found for merchant ${merchantId}`,
      );

    // Get current payment order for this POS (ACTIVE status)
    const currentPaymentOrder = await this.paymentOrderRepository.findOne({
      where: {
        pos: { id },
        status: PaymentOrderStatus.ACTIVE,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // Get recent transactions for this POS
    const transactions = await this.paymentOrderRepository.find({
      where: {
        pos: { id },
      },
      order: {
        createdAt: 'DESC',
      },
      take: 20, // Limit to 20 most recent transactions
    });

    // Add the additional data to the POS object
    const posWithData = {
      ...pos,
      currentPaymentOrder: currentPaymentOrder || undefined,
      transactions: transactions,
    };

    return posWithData as any;
  }

  async findOneByPosId(id: UUID): Promise<Pos> {
    const pos = await this.posRepository.findOne({
      where: { id },
      relations: ['branch', 'branch.merchant'],
    });
    if (!pos) throw new NotFoundException(`POS ${id} not found`);
    return pos;
  }

  async findAllByMerchant(
    merchantId: UUID,
    branchId?: UUID,
    includeDeactivated: boolean = false,
  ): Promise<Pos[]> {
    const whereClause: any = {
      branch: { merchant: { id: merchantId } },
    };

    if (branchId) {
      whereClause.branch.id = branchId;
    }

    if (!includeDeactivated) {
      whereClause.isActive = true;
    }

    return this.posRepository.find({
      where: whereClause,
      relations: ['branch'],
    });
  }

  async update(
    merchantId: UUID,
    branchId: UUID,
    id: UUID,
    updatePosDto: UpdatePosDto,
  ): Promise<Pos> {
    await this.branchService.findOne(branchId, merchantId);
    const pos = await this.findOne(merchantId, branchId, id);

    Object.assign(pos, updatePosDto);

    // Regenerate QR code if it doesn't exist or if POS details changed
    if (!pos.qrCode || updatePosDto.name || updatePosDto.description) {
      const qrCode = this.qrCodeService.generatePosQrCode(
        merchantId,
        branchId,
        pos.id,
      );
      pos.qrCode = qrCode.url;
      this.logger.log(`Updated QR code for POS ${pos.id}: ${pos.qrCode}`);
    }

    return this.posRepository.save(pos);
  }

  async updateByMerchant(
    merchantId: UUID,
    id: UUID,
    updatePosDto: UpdatePosDto,
  ): Promise<Pos> {
    const pos = await this.findOneByMerchant(merchantId, id);

    Object.assign(pos, updatePosDto);

    // Regenerate QR code if it doesn't exist or if POS details changed
    if (!pos.qrCode || updatePosDto.name || updatePosDto.description) {
      const qrCode = this.qrCodeService.generatePosQrCode(
        merchantId,
        pos.branch.id,
        pos.id,
      );
      pos.qrCode = qrCode.url;
      this.logger.log(`Updated QR code for POS ${pos.id}: ${pos.qrCode}`);
    }

    return this.posRepository.save(pos);
  }

  async remove(merchantId: UUID, branchId: UUID, id: UUID): Promise<void> {
    await this.branchService.findOne(branchId, merchantId);
    const pos = await this.findOne(merchantId, branchId, id);

    if (!pos.isActive) {
      throw new ForbiddenException(`POS ${id} is already deactivated`);
    }

    // Soft delete: deactivate the POS
    pos.deactivate();
    await this.posRepository.save(pos);

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

  async removeByMerchant(merchantId: UUID, id: UUID): Promise<void> {
    const pos = await this.findOneByMerchant(merchantId, id);

    if (!pos.isActive) {
      throw new ForbiddenException(`POS ${id} is already deactivated`);
    }

    // Soft delete: deactivate the POS
    pos.deactivate();
    await this.posRepository.save(pos);

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

  /**
   * Get QR code information for a POS
   * @param merchantId - The merchant ID
   * @param branchId - The branch ID
   * @param posId - The POS ID
   * @returns QR code information including URL and image URL
   */
  async getQrCode(merchantId: UUID, branchId: UUID, posId: UUID) {
    const pos = await this.findOne(merchantId, branchId, posId);

    if (!pos.qrCode) {
      // Generate QR code if it doesn't exist
      const qrCode = this.qrCodeService.generatePosQrCode(
        merchantId,
        branchId,
        posId,
      );
      pos.qrCode = qrCode.url;
      await this.posRepository.save(pos);
    }

    const qrCodeInfo = this.qrCodeService.generatePosQrCode(
      merchantId,
      branchId,
      posId,
    );

    return {
      posId: pos.id,
      posName: pos.name,
      qrCodeUrl: qrCodeInfo.url,
      qrCodeImageUrl: qrCodeInfo.imageUrl,
    };
  }
}
