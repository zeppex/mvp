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
  ForbiddenException,
  HttpCode,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
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

@ApiBearerAuth('access-token')
@ApiTags('payment-orders')
@UseGuards(JwtAuthGuard, RolesGuard, MerchantGuard)
@Controller('merchants/:merchantId/branches/:branchId/pos/:posId/orders')
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
  @ApiBody({ type: CreatePaymentOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Payment order created.',
    type: PaymentOrder,
  })
  async create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    dto: CreatePaymentOrderDto,
    @Request() req,
  ): Promise<any> {
    try {
      const order = await this.orderService.create(
        merchantId,
        branchId,
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
  @ApiOperation({ summary: 'Retrieve all payment orders for a POS' })
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
    description: 'List of payment orders.',
    type: [PaymentOrder],
  })
  async findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Request() req,
  ): Promise<any[]> {
    const orders = await this.orderService.findAll(merchantId, branchId, posId);
    return orders.map((order) => ({
      ...order,
      amount: Number(order.amount).toFixed(2),
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a payment order by ID' })
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
  @ApiResponse({
    status: 200,
    description: 'Return the payment order.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async findOne(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<any> {
    const order = await this.orderService.findOne(
      merchantId,
      branchId,
      posId,
      id,
    );
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
  @ApiOperation({ summary: 'Update a payment order by ID' })
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
  @ApiBody({ type: UpdatePaymentOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Payment order successfully updated.',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async update(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updatePaymentOrderDto: UpdatePaymentOrderDto,
    @Request() req,
  ): Promise<any> {
    try {
      const order = await this.orderService.update(
        merchantId,
        branchId,
        posId,
        id,
        updatePaymentOrderDto,
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

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete a payment order by ID' })
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
  @ApiResponse({ status: 204, description: 'Payment order deleted.' })
  @ApiResponse({ status: 404, description: 'Payment order not found.' })
  async remove(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    await this.orderService.remove(merchantId, branchId, posId, id);
  }

  @Post(':id/trigger-in-progress')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Trigger payment order to IN_PROGRESS status (for payment processing)',
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
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<any> {
    const order = await this.orderService.triggerInProgress(
      merchantId,
      branchId,
      posId,
      id,
    );
    return {
      ...order,
      amount: Number(order.amount).toFixed(2),
    };
  }
}
