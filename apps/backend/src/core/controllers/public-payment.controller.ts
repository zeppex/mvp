import {
  Controller,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
  ForbiddenException,
  NotFoundException,
  HttpCode,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

@ApiTags('public-payments')
@Controller('public/merchants/:merchantId/branches/:branchId/pos/:posId/orders')
export class PublicPaymentController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Post(':id/trigger-in-progress')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary:
      'Trigger payment order in-progress status (Public endpoint for QR code scanning)',
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
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Payment API key for customer authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment order status changed to IN_PROGRESS.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 403, description: 'Order cannot be processed.' })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  @ApiResponse({ status: 401, description: 'Invalid API key.' })
  async triggerInProgress(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) orderId: UUID,
  ): Promise<any> {
    try {
      // Use the new service method that validates merchant ownership
      const order = await this.orderService.triggerInProgressByMerchant(
        merchantId,
        orderId,
      );

      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
        message: 'Payment processing started successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For any other error, return a generic forbidden to avoid exposing internal details
      throw new ForbiddenException(
        'Payment order cannot be processed at this time.',
      );
    }
  }
}

@ApiTags('public-payments')
@Controller('public/pos/:posId/orders')
export class SimplifiedPublicPaymentController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Post(':id/trigger-in-progress')
  @HttpCode(200)
  @UseGuards(ApiKeyGuard)
  @ApiOperation({
    summary:
      'Trigger payment order in-progress status (Simplified public endpoint)',
  })
  @ApiParam({ name: 'posId', description: 'ID of the POS', type: 'string' })
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Payment API key for customer authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment order status changed to IN_PROGRESS.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 403, description: 'Order cannot be processed.' })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  @ApiResponse({ status: 401, description: 'Invalid API key.' })
  async triggerInProgress(
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) orderId: UUID,
  ): Promise<any> {
    try {
      // Find the POS to get merchant context
      const pos = await this.orderService['posService'].findOneByPosId(posId);
      const merchantId = pos.branch.merchant.id;

      // Use the new service method that validates merchant ownership
      const order = await this.orderService.triggerInProgressByMerchant(
        merchantId,
        orderId,
      );

      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
        message: 'Payment processing started successfully',
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      // For any other error, return a generic forbidden to avoid exposing internal details
      throw new ForbiddenException(
        'Payment order cannot be processed at this time.',
      );
    }
  }
}
