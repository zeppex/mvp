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
      const user = req.user;

      if (!posId) {
        throw new BadRequestException('POS ID is required');
      }

      // For CASHIER role, check if they are assigned to the specific POS
      if (user.role === UserRole.CASHIER) {
        if (!user.posId || user.posId !== posId) {
          throw new BadRequestException(
            'Cashier can only create orders for their assigned POS',
          );
        }
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

  @Post(':id/complete')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Complete a payment order and mint tokens' })
  @ApiParam({ name: 'id', description: 'Payment order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment order completed successfully.',
    type: PaymentOrder,
  })
  @HttpCode(200)
  async completePayment(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<any> {
    try {
      const merchantId = req.user.merchantId;
      const order = await this.orderService.completePayment(merchantId, id);

      return {
        ...order,
        amount: Number(order.amount).toFixed(2),
        message:
          'Payment completed successfully. ZEPPEX tokens have been minted to the branch.',
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid input: ' + error.message);
      }
      throw error;
    }
  }

  @Post(':id/trigger-in-progress')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Trigger payment order to in-progress status' })
  @ApiParam({ name: 'id', description: 'Payment order ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment order status updated to in-progress.',
    type: PaymentOrder,
  })
  @HttpCode(200)
  async triggerInProgress(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<any> {
    try {
      const merchantId = req.user.merchantId;
      const order = await this.orderService.triggerInProgressByMerchant(
        merchantId,
        id,
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
}
