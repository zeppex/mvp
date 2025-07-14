import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  NotFoundException,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('public-payment-orders')
@Controller('public/merchants/:merchantId/branches/:branchId/pos/:posId/orders')
export class PublicPaymentOrderController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Get('current')
  @ApiOperation({
    summary:
      'Get current active payment order for a POS (Public endpoint for QR code scanning)',
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
      // Use the new service method that validates merchant ownership
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
        qrCodeUrl: `/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
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
