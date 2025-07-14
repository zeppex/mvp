import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Request,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { CreatePaymentOrderDto, UpdatePaymentOrderDto } from '../dto';
import { PaymentOrder } from '../entities/payment-order.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../../auth/guards/merchant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { ValidationPipe } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@ApiBearerAuth('access-token')
@ApiTags('payment-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class PaymentOrderController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Post()
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Create a new payment order' })
  @ApiBody({ type: CreatePaymentOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Payment order created.',
    type: PaymentOrder,
  })
  async create(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreatePaymentOrderDto,
    @Request() req,
  ): Promise<any> {
    try {
      const merchantId = req.user.merchantId;
      const posId = dto.posId;

      if (!posId) {
        throw new BadRequestException('POS ID is required');
      }

      const order = await this.orderService.createByMerchant(
        merchantId,
        posId,
        dto,
      );
      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid input: ' + error.message);
      }
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all payment orders for the current merchant',
  })
  @ApiResponse({
    status: 200,
    description: 'List of payment orders.',
    type: [PaymentOrder],
  })
  async findAll(@Request() req): Promise<any[]> {
    const merchantId = req.user.merchantId;
    const orders = await this.orderService.findAllByMerchant(merchantId);
    return orders.map((order) => ({
      ...order,
      amount: Number(order.amount).toFixed(2),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific payment order by ID' })
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Payment order details.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<any> {
    const merchantId = req.user.merchantId;
    const order = await this.orderService.findOneByMerchant(merchantId, id);
    return {
      ...order,
      amount: Number(order.amount).toFixed(2),
    };
  }

  @Put(':id')
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Update a payment order' })
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiBody({ type: UpdatePaymentOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Payment order updated.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updateOrderDto: UpdatePaymentOrderDto,
    @Request() req,
  ): Promise<any> {
    const merchantId = req.user.merchantId;
    // Verify order belongs to merchant before updating
    await this.orderService.findOneByMerchant(merchantId, id);
    const order = await this.orderService.updateByMerchant(
      merchantId,
      id,
      updateOrderDto,
    );
    return {
      ...order,
      amount: Number(order.amount).toFixed(2),
    };
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Cancel a payment order' })
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Payment order cancelled.',
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    const merchantId = req.user.merchantId;
    // Verify order belongs to merchant before deleting
    await this.orderService.findOneByMerchant(merchantId, id);
    return this.orderService.removeByMerchant(merchantId, id);
  }

  @Post(':id/trigger-in-progress')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Trigger payment order to IN_PROGRESS status (for payment processing)',
  })
  @ApiParam({ name: 'id', description: 'Payment order ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Payment order status changed to IN_PROGRESS.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  @ApiResponse({
    status: 403,
    description: 'Payment order cannot be processed (expired or wrong status).',
  })
  async triggerInProgress(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<any> {
    const merchantId = req.user.merchantId;
    // Verify order belongs to merchant before triggering
    await this.orderService.findOneByMerchant(merchantId, id);
    const order = await this.orderService.triggerInProgressByMerchant(
      merchantId,
      id,
    );
    return {
      ...order,
      amount: Number(order.amount).toFixed(2),
    };
  }
}
