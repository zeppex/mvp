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
import { MerchantService } from '../services/merchant.service';
import { CreateMerchantDto } from '../dto/create-merchant.dto';
import { Merchant } from '../entities/merchant.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('merchants')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({
    status: 201,
    description: 'Merchant successfully created.',
    type: Merchant,
  })
  @ApiBody({ type: CreateMerchantDto })
  async create(
    @Body() createMerchantDto: CreateMerchantDto,
    @Request() req,
  ): Promise<Merchant> {
    // For ADMIN users, tenantId must be provided
    if (req.user.role === UserRole.ADMIN && !req.body.tenantId) {
      throw new ForbiddenException(
        'tenantId is required when creating a merchant as an admin',
      );
    }

    // For TENANT_ADMIN, use their own tenantId and validate they're not trying to create for another tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      if (req.body.tenantId && req.body.tenantId !== req.user.tenantId) {
        throw new ForbiddenException(
          'You can only create merchants for your own tenant',
        );
      }
      return this.merchantService.create(createMerchantDto, req.user.tenantId);
    }

    // For ADMIN, use the provided tenantId
    return this.merchantService.create(createMerchantDto, req.body.tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all merchants' })
  @ApiResponse({
    status: 200,
    description: 'Return all merchants.',
    type: [Merchant],
  })
  async findAll(@Request() req): Promise<Merchant[]> {
    // ADMIN can see all merchants (optionally filtered by tenantId)
    if (req.user.role === UserRole.ADMIN) {
      if (req.query.tenantId) {
        return this.merchantService.findByTenant(req.query.tenantId);
      }
      return this.merchantService.findAll();
    }

    // TENANT_ADMIN and other roles can only see merchants from their tenant
    return this.merchantService.findByTenant(req.user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a merchant by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Merchant ID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the merchant.',
    type: Merchant,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Request() req): Promise<Merchant> {
    const merchant = await this.merchantService.findOne(id);
    
    // If user is not SUPERADMIN or ADMIN, check tenant access
    if (req.user.role !== UserRole.SUPERADMIN && req.user.role !== UserRole.ADMIN) {
      if (merchant.tenant?.id !== req.user.tenantId) {
        throw new ForbiddenException(
          'You can only access merchants from your own tenant',
        );
      }
    }
    
    return merchant;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a merchant by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Merchant successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.TENANT_ADMIN)
  async remove(@Param('id', new ParseUUIDPipe()) id: string, @Request() req): Promise<void> {
    const merchant = await this.merchantService.findOne(id);
    
    // If user is not SUPERADMIN or ADMIN, check tenant access
    if (req.user.role !== UserRole.SUPERADMIN && req.user.role !== UserRole.ADMIN) {
      if (merchant.tenant?.id !== req.user.tenantId) {
        throw new ForbiddenException(
          'You can only delete merchants from your own tenant',
        );
      }
    }
    
    return this.merchantService.remove(id);
  }

  @Post(':id/binance-submerchant')
  @ApiOperation({ summary: 'Create Binance Pay sub-merchant for a merchant' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Merchant ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Sub-merchant ID created and merchant updated.',
    type: Merchant,
  })
  createBinanceSubMerchant(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Merchant> {
    return this.merchantService.createBinanceSubMerchant(id);
  }
}
