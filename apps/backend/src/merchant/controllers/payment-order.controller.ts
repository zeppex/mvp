import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentOrderService } from '../services/payment-order.service';
import { CreatePaymentOrderDto } from '../dto';
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
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('payment-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    @Body() dto: CreatePaymentOrderDto,
    @Request() req,
  ): Promise<PaymentOrder> {
    // For ADMIN, verify they can only access their own merchant
    if (
      req.user.role === UserRole.ADMIN &&
      merchantId !== req.user.merchantId
    ) {
      throw new ForbiddenException(
        'You can only create payment orders for your own merchant',
      );
    }

    // For BRANCH_ADMIN, verify they can only access their own branch
    if (
      req.user.role === UserRole.BRANCH_ADMIN &&
      branchId !== req.user.branchId
    ) {
      throw new ForbiddenException(
        'You can only create payment orders for your own branch',
      );
    }

    // For CASHIER, verify they can only access their own POS
    if (req.user.role === UserRole.CASHIER && posId !== req.user.posId) {
      throw new ForbiddenException(
        'You can only create payment orders for your own POS',
      );
    }

    return this.orderService.create(merchantId, branchId, posId, dto);
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
  ): Promise<PaymentOrder[]> {
    // For ADMIN, verify they can only access their own merchant
    if (
      req.user.role === UserRole.ADMIN &&
      merchantId !== req.user.merchantId
    ) {
      throw new ForbiddenException(
        'You can only access payment orders for your own merchant',
      );
    }

    // For BRANCH_ADMIN, verify they can only access their own branch
    if (
      req.user.role === UserRole.BRANCH_ADMIN &&
      branchId !== req.user.branchId
    ) {
      throw new ForbiddenException(
        'You can only access payment orders for your own branch',
      );
    }

    // For CASHIER, verify they can only access their own POS
    if (req.user.role === UserRole.CASHIER && posId !== req.user.posId) {
      throw new ForbiddenException(
        'You can only access payment orders for your own POS',
      );
    }

    return this.orderService.findAll(merchantId, branchId, posId);
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
  ): Promise<PaymentOrder> {
    // For ADMIN, verify they can only access their own merchant
    if (
      req.user.role === UserRole.ADMIN &&
      merchantId !== req.user.merchantId
    ) {
      throw new ForbiddenException(
        'You can only access payment orders for your own merchant',
      );
    }

    // For BRANCH_ADMIN, verify they can only access their own branch
    if (
      req.user.role === UserRole.BRANCH_ADMIN &&
      branchId !== req.user.branchId
    ) {
      throw new ForbiddenException(
        'You can only access payment orders for your own branch',
      );
    }

    // For CASHIER, verify they can only access their own POS
    if (req.user.role === UserRole.CASHIER && posId !== req.user.posId) {
      throw new ForbiddenException(
        'You can only access payment orders for your own POS',
      );
    }

    return this.orderService.findOne(merchantId, branchId, posId, id);
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
    // For ADMIN, verify they can only access their own merchant
    if (
      req.user.role === UserRole.ADMIN &&
      merchantId !== req.user.merchantId
    ) {
      throw new ForbiddenException(
        'You can only delete payment orders for your own merchant',
      );
    }

    // For BRANCH_ADMIN, verify they can only access their own branch
    if (
      req.user.role === UserRole.BRANCH_ADMIN &&
      branchId !== req.user.branchId
    ) {
      throw new ForbiddenException(
        'You can only delete payment orders for your own branch',
      );
    }

    return this.orderService.remove(merchantId, branchId, posId, id);
  }
}
