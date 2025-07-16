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
  Query,
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
  ApiQuery,
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
@Controller('pos')
export class PosController {
  private readonly logger = new Logger(PosController.name);
  constructor(
    private readonly posService: PosService,
    private readonly paymentOrderService: PaymentOrderService,
  ) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create a new POS for a branch' })
  @ApiBody({ type: CreatePosDto })
  @ApiResponse({
    status: 201,
    description: 'POS successfully created.',
    type: Pos,
  })
  async create(
    @Body() createPosDto: CreatePosDto,
    @Request() req,
  ): Promise<Pos> {
    // MerchantGuard ensures that merchantId is available for non-superadmin users
    // For superadmin, merchantId should come from request body
    let merchantId = req.user.merchantId;

    if (!merchantId) {
      // For superadmin, extract from request body
      merchantId = createPosDto.merchantId;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    const branchId = createPosDto.branchId;

    // Remove merchantId from DTO before passing to service
    const { merchantId: _, ...posData } = createPosDto;

    return this.posService.create(merchantId, branchId, posData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all POS for the current merchant' })
  @ApiQuery({
    name: 'includeDeactivated',
    required: false,
    type: Boolean,
    description: 'Include deactivated POS in the response',
  })
  @ApiResponse({ status: 200, description: 'Return all POS.', type: [Pos] })
  async findAll(
    @Request() req,
    @Query('includeDeactivated') includeDeactivated?: string,
  ): Promise<Pos[]> {
    let merchantId = req.user.merchantId;
    const branchId = req.user.branchId; // This might be undefined for admin users

    // For superadmin, we need merchantId from query params
    if (!merchantId) {
      merchantId = req.query.merchantId as string;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    this.logger.log(
      `Fetching POS for merchant ${merchantId}, branch ${branchId}`,
    );

    const includeDeactivatedBool = includeDeactivated === 'true';
    return this.posService.findAllByMerchant(
      merchantId,
      branchId, // Pass undefined to get all POS for the merchant
      includeDeactivatedBool,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific POS by ID' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return the POS.',
    type: Pos,
  })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<Pos> {
    let merchantId = req.user.merchantId;

    // For superadmin, we need merchantId from query params
    if (!merchantId) {
      merchantId = req.query.merchantId as string;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    return this.posService.findOneByMerchant(merchantId, id);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update a POS' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiBody({ type: UpdatePosDto })
  @ApiResponse({
    status: 200,
    description: 'POS successfully updated.',
    type: Pos,
  })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updatePosDto: UpdatePosDto,
    @Request() req,
  ): Promise<Pos> {
    let merchantId = req.user.merchantId;

    // For superadmin, we need merchantId from request body
    if (!merchantId) {
      merchantId = (updatePosDto as any).merchantId;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    // Verify POS belongs to merchant before updating
    await this.posService.findOneByMerchant(merchantId, id);
    return this.posService.updateByMerchant(merchantId, id, updatePosDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Deactivate a POS' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'POS successfully deactivated.',
  })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    let merchantId = req.user.merchantId;

    // For superadmin, we need merchantId from query params
    if (!merchantId) {
      merchantId = req.query.merchantId as string;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    // Verify POS belongs to merchant before deleting
    await this.posService.findOneByMerchant(merchantId, id);
    return this.posService.removeByMerchant(merchantId, id);
  }

  @Get(':id/paymentorder')
  @ApiOperation({ summary: 'Get current payment order for a POS' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Return current active payment order',
    type: PaymentOrder,
  })
  @ApiResponse({ status: 404, description: 'No active order for pos' })
  async getCurrentPaymentOrder(
    @Param('id', new ParseUUIDPipe()) posId: UUID,
    @Request() req,
  ): Promise<PaymentOrder> {
    let merchantId = req.user.merchantId;

    // For superadmin, we need merchantId from query params
    if (!merchantId) {
      merchantId = req.query.merchantId as string;
      if (!merchantId) {
        throw new ForbiddenException('Merchant ID is required');
      }
    }

    // Verify POS belongs to merchant before getting payment order
    await this.posService.findOneByMerchant(merchantId, posId);
    return this.paymentOrderService.getCurrentByMerchant(merchantId, posId);
  }
}
