import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { PosService } from '../services/pos.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('public-payment-order')
@Controller('public/payment-order')
export class PublicPaymentOrderController {
  private readonly logger = new Logger(PublicPaymentOrderController.name);

  constructor(
    private readonly paymentOrderService: PaymentOrderService,
    private readonly posService: PosService,
  ) {}

  @Get('pos/:posId')
  @ApiOperation({ summary: 'Get current payment order for a POS (public)' })
  @ApiParam({ name: 'posId', description: 'POS ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the current payment order.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'POS or payment order not found.' })
  async getCurrentPaymentOrder(
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
  ): Promise<PaymentOrder> {
    this.logger.log(`Getting current payment order for POS: ${posId}`);

    // First, verify the POS exists and is active
    const pos = await this.posService.findOneByPosId(posId);

    if (!pos.isActive) {
      throw new NotFoundException(`POS ${posId} is not active`);
    }

    // Get the current payment order for this POS
    try {
      const currentOrder = await this.paymentOrderService.getCurrentByMerchant(
        pos.branch.merchant.id,
        posId,
      );

      // Return only the necessary information for the public payment page
      return {
        id: currentOrder.id,
        amount: currentOrder.amount,
        currency: 'USD', // Default currency since it's not stored in the entity
        description: currentOrder.description,
        status: currentOrder.status,
        createdAt: currentOrder.createdAt,
        expiresAt: currentOrder.expiresAt,
        pos: {
          id: pos.id,
          name: pos.name,
          description: pos.description,
        },
        branch: {
          id: pos.branch.id,
          name: pos.branch.name,
        },
        merchant: {
          id: pos.branch.merchant.id,
          name: pos.branch.merchant.name,
        },
      } as any;
    } catch (error) {
      this.logger.log(`No current payment order found for POS: ${posId}`);
      throw new NotFoundException(`No active payment order found for this POS`);
    }
  }
}

@ApiTags('public-payment-orders')
@Controller('public/pos/:posId/orders')
export class SimplifiedPublicPaymentOrderController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Get('current')
  @ApiOperation({
    summary:
      'Get current active payment order for a POS (Simplified public endpoint)',
  })
  @ApiParam({ name: 'posId', description: 'ID of the POS', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Current active payment order.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'No active payment order found.' })
  async getCurrent(
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
  ): Promise<any> {
    try {
      // Find the POS to get merchant context
      const pos = await this.orderService['posService'].findOneByPosId(posId);
      const merchantId = pos.branch.merchant.id;

      const order = await this.orderService.getCurrentByMerchant(
        merchantId,
        posId,
      );
      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
        expiresIn: order.expiresAt
          ? Math.max(0, order.expiresAt.getTime() - Date.now())
          : null,
        qrCodeUrl: `/public/pos/${posId}/orders/current`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For any other error, return a generic not found to avoid exposing internal details
      throw new NotFoundException('No active payment order found.');
    }
  }
}
