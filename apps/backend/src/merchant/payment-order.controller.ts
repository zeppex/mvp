import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentOrderService } from './payment-order.service';
import { CreatePaymentOrderDto } from './dto';
import { PaymentOrder } from './payment-order.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('payment-orders')
@Controller('merchants/:merchantId/branches/:branchId/pos/:posId/orders')
export class PaymentOrderController {
  constructor(private readonly orderService: PaymentOrderService) {}

  @Post()
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
  create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Body() dto: CreatePaymentOrderDto,
  ): Promise<PaymentOrder> {
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
  findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
  ): Promise<PaymentOrder[]> {
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
  findOne(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<PaymentOrder> {
    return this.orderService.findOne(merchantId, branchId, posId, id);
  }

  @Delete(':id')
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
  remove(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('posId', new ParseUUIDPipe()) posId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<void> {
    return this.orderService.remove(merchantId, branchId, posId, id);
  }
}
