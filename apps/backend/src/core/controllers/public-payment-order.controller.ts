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
  UseGuards,
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
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';

@ApiTags('public-payment-order')
@Controller('public/payment-order')
export class PublicPaymentOrderController {
  private readonly logger = new Logger(PublicPaymentOrderController.name);

  constructor(
    private readonly paymentOrderService: PaymentOrderService,
    private readonly posService: PosService,
  ) {}

  @Get(':orderId')
  @ApiOperation({ summary: 'Get payment order by ID (public)' })
  @ApiParam({
    name: 'orderId',
    description: 'Payment Order ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the payment order.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async getPaymentOrderById(
    @Param('orderId', new ParseUUIDPipe()) orderId: UUID,
  ): Promise<PaymentOrder> {
    this.logger.log(`Getting payment order by ID: ${orderId}`);

    try {
      // Get the payment order by ID
      const order = await this.paymentOrderService.findOneById(orderId);

      // Get the POS details
      const pos = await this.posService.findOneByPosId(order.posId);

      // Return only the necessary information for the public payment page
      return {
        id: order.id,
        amount: order.amount,
        currency: 'USD', // Default currency since it's not stored in the entity
        description: order.description,
        status: order.status,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
        expiresIn: order.expiresAt
          ? Math.max(0, order.expiresAt.getTime() - Date.now())
          : null,
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
      this.logger.log(`Payment order not found: ${orderId}`);
      throw new NotFoundException(`Payment order not found`);
    }
  }

  @Get('pos/:posId/current')
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

    try {
      // Get the current payment order using the service method
      const order = await this.paymentOrderService.getCurrentByPosId(posId);

      // Get the POS details
      const pos = await this.posService.findOneByPosId(posId);

      // Return only the necessary information for the public payment page
      return {
        id: order.id,
        amount: order.amount,
        currency: 'USD', // Default currency since it's not stored in the entity
        description: order.description,
        status: order.status,
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
        expiresIn: order.expiresAt
          ? Math.max(0, order.expiresAt.getTime() - Date.now())
          : null,
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

  @Post(':orderId/trigger-in-progress')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary: 'Trigger payment order to in-progress status',
  })
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
    @Param('orderId', new ParseUUIDPipe()) orderId: UUID,
    @Headers('x-api-key') apiKey: string,
  ): Promise<any> {
    // API key validation is handled by the ApiKeyGuard
    // The guard will throw UnauthorizedException if the key is invalid

    try {
      // Get the payment order
      const order = await this.paymentOrderService.findOneById(orderId);

      if (!order) {
        throw new NotFoundException('Payment order not found');
      }

      // Get the POS to get merchant context
      const pos = await this.posService.findOneByPosId(order.posId);
      const merchantId = pos.branch?.merchant?.id;

      if (!merchantId) {
        throw new ForbiddenException('Cannot determine merchant context');
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
        PaymentOrderStatus.COMPLETED,
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
