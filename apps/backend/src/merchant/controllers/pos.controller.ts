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
import { PosService } from '../services/pos.service';
import { CreatePosDto } from '../dto';
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
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';
import { BranchService } from '../services/branch.service';

@ApiBearerAuth('access-token')
@ApiTags('pos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches/:branchId/')
export class PosController {
  constructor(
    private readonly posService: PosService,
    private readonly paymentOrderService: PaymentOrderService,
    private readonly branchService: BranchService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
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
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        branchId,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only create POS for branches in your tenant',
        );
      }
    }

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
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        branchId,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only access POS for branches in your tenant',
        );
      }
    }

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
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        branchId,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only access POS for branches in your tenant',
        );
      }
    }

    return this.posService.findOne(merchantId, branchId, id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
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
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        branchId,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only delete POS for branches in your tenant',
        );
      }
    }

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
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        branchId,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only access payment orders for branches in your tenant',
        );
      }
    }

    return this.paymentOrderService.getCurrent(merchantId, branchId, posId);
  }
}
