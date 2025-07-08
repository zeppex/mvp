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
  Logger,
} from '@nestjs/common';
import { PosService } from '../services/pos.service';
import { CreatePosDto, UpdatePosDto } from '../dto';
import { Pos } from '../entities/pos.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UUID } from 'crypto';
import { PaymentOrderService } from '../services/payment-order.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../../auth/guards/merchant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('pos')
@UseGuards(JwtAuthGuard, RolesGuard, MerchantGuard)
@Controller('merchants/:merchantId/branches/:branchId/pos')
export class PosController {
  private readonly logger = new Logger(PosController.name);
  constructor(
    private readonly posService: PosService,
    private readonly paymentOrderService: PaymentOrderService,
  ) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new POS for a branch' })
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
  @ApiBody({ type: CreatePosDto })
  @ApiResponse({
    status: 201,
    description: 'POS successfully created.',
    type: Pos,
  })
  async create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Body() createPosDto: CreatePosDto,
    @Request() req,
  ): Promise<Pos> {
    return this.posService.create(merchantId, branchId, createPosDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all POS for a branch' })
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
  @ApiResponse({ status: 200, description: 'Return all POS.', type: [Pos] })
  async findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Request() req,
  ): Promise<Pos[]> {
    this.logger.log(
      `Fetching POS for merchant ${merchantId}, branch ${branchId}`,
    );

    return this.posService.findAll(merchantId, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a POS by ID for a branch' })
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
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the POS.', type: Pos })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async findOne(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<Pos> {
    return this.posService.findOne(merchantId, branchId, id);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update a POS by ID for a branch' })
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
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiBody({ type: UpdatePosDto })
  @ApiResponse({
    status: 200,
    description: 'POS successfully updated.',
    type: Pos,
  })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async update(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updatePosDto: UpdatePosDto,
    @Request() req,
  ): Promise<Pos> {
    return this.posService.update(merchantId, branchId, id, updatePosDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete a POS by ID for a branch' })
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
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'POS successfully deleted.' })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async remove(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    return this.posService.remove(merchantId, branchId, id);
  }

  @Get(':id/paymentorder')
  @ApiOperation({ summary: 'Get current payment order for a POS' })
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
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return current active payment order',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'No active order for pos' })
  async getCurrentPaymentOrder(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) posId: UUID,
    @Request() req,
  ): Promise<PaymentOrder> {
    return this.paymentOrderService.getCurrent(merchantId, branchId, posId);
  }
}
