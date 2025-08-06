import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
  Logger,
  Post,
  Headers,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { PosService } from '../services/pos.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

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
      // Handle case where merchant relationship might be null
      let merchantId = pos.branch?.merchant?.id;
      if (!merchantId) {
        // Try to get merchant ID from the branch directly
        const branchWithMerchant = await this.posService[
          'branchService'
        ].findOne(pos.branch.id);
        merchantId = branchWithMerchant.merchant?.id;
      }

      // Use a dummy merchant ID if still not found - the service will handle the fallback
      if (!merchantId) {
        merchantId = '00000000-0000-0000-0000-000000000000';
      }

      const currentOrder = await this.paymentOrderService.getCurrentByMerchant(
        merchantId,
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
          id: pos.branch?.merchant?.id || 'unknown',
          name: pos.branch?.merchant?.name || 'Unknown Merchant',
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
      let merchantId = pos.branch?.merchant?.id;

      // Use a dummy merchant ID if not found - the service will handle the fallback
      if (!merchantId) {
        merchantId = '00000000-0000-0000-0000-000000000000';
      }

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

@ApiTags('public-payment-orders-full')
@Controller('public/merchants/:merchantId/branches/:branchId/pos/:posId/orders')
export class FullPublicPaymentOrderController {
  private readonly logger = new Logger(FullPublicPaymentOrderController.name);

  constructor(
    private readonly paymentOrderService: PaymentOrderService,
    private readonly posService: PosService,
  ) {}

  @Get('current')
  @ApiOperation({
    summary:
      'Get current active payment order for a POS (Full path public endpoint)',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({
    name: 'branchId',
    description: 'ID of the branch',
    type: 'string',
  })
  @ApiParam({ name: 'posId', description: 'ID of the POS', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Current active payment order.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'No active payment order found.' })
  async getCurrent(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
  ): Promise<any> {
    try {
      // Verify the POS exists and belongs to the specified merchant and branch
      const pos = await this.posService.findOne(merchantId, branchId, posId);

      if (!pos.isActive) {
        throw new NotFoundException(`POS ${posId} is not active`);
      }

      const order = await this.paymentOrderService.getCurrentByMerchant(
        merchantId,
        posId,
      );

      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
        expiresIn: order.expiresAt
          ? Math.max(0, order.expiresAt.getTime() - Date.now())
          : null,
        qrCodeUrl: `/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
      };
    } catch (error) {
      this.logger.log(`Error getting current payment order: ${error.message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('No active payment order found.');
    }
  }

  @Post(':orderId/trigger-in-progress')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Trigger payment order to in-progress status',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({
    name: 'branchId',
    description: 'ID of the branch',
    type: 'string',
  })
  @ApiParam({ name: 'posId', description: 'ID of the POS', type: 'string' })
  @ApiParam({
    name: 'orderId',
    description: 'ID of the payment order',
    type: 'string',
  })
  @ApiHeader({ name: 'x-api-key', description: 'Payment API key' })
  @ApiResponse({
    status: 200,
    description: 'Payment order status updated to in-progress.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - order not in active status.',
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async triggerInProgress(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('orderId', new ParseUUIDPipe()) orderId: UUID,
    @Headers('x-api-key') apiKey: string,
  ): Promise<any> {
    // Validate API key
    if (!apiKey || apiKey !== 'test-payment-api-key-12345') {
      throw new ForbiddenException('Invalid API key');
    }

    try {
      // Verify the POS exists and belongs to the specified merchant and branch
      await this.posService.findOne(merchantId, branchId, posId);

      // Get the payment order
      const order = await this.paymentOrderService.findOneByMerchant(
        merchantId,
        orderId,
      );

      if (!order) {
        throw new NotFoundException('Payment order not found');
      }

      // Check if order belongs to the specified POS
      if (order.pos.id !== posId) {
        throw new ForbiddenException(
          'Payment order does not belong to this POS',
        );
      }

      // Check if order is in ACTIVE status
      if (order.status !== PaymentOrderStatus.ACTIVE) {
        throw new ForbiddenException(
          'Only active orders can be triggered to in-progress',
        );
      }

      // Update order status to IN_PROGRESS
      const updatedOrder = await this.paymentOrderService.updateOrderStatus(
        merchantId,
        orderId,
        PaymentOrderStatus.IN_PROGRESS,
      );

      return {
        id: updatedOrder.id,
        status: updatedOrder.status,
        message: 'Payment order status updated to in-progress',
      };
    } catch (error) {
      this.logger.log(`Error triggering in-progress: ${error.message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new NotFoundException('Payment order not found');
    }
  }
}
