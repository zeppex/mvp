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
  Logger,
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
  private readonly logger = new Logger(MerchantController.name);

  constructor(private readonly merchantService: MerchantService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
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
    this.logger.log('🏪 Creating new merchant...');
    this.logger.debug(
      '📋 Received DTO:',
      JSON.stringify(createMerchantDto, null, 2),
    );
    this.logger.debug('👤 Requested by user:', req.user?.id);
    this.logger.debug('🔐 User role:', req.user?.role);

    try {
      const result = await this.merchantService.create(createMerchantDto);
      this.logger.log('✅ Merchant created successfully with ID:', result.id);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to create merchant:', error.message);
      this.logger.error(
        '🔍 DTO that caused error:',
        JSON.stringify(createMerchantDto, null, 2),
      );
      throw error;
    }
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Retrieve all merchants' })
  @ApiResponse({
    status: 200,
    description: 'Return all merchants.',
    type: [Merchant],
  })
  async findAll(@Request() req): Promise<Merchant[]> {
    // SUPERADMIN can see all merchants
    if (req.user.role === UserRole.SUPERADMIN) {
      return this.merchantService.findAll();
    }

    // ADMIN can only see their own merchant
    if (req.user.role === UserRole.ADMIN) {
      return [await this.merchantService.findOne(req.user.merchantId)];
    }

    throw new ForbiddenException('Insufficient permissions');
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Retrieve a merchant by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Return the merchant.',
    type: Merchant,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req,
  ): Promise<Merchant> {
    const merchant = await this.merchantService.findOne(id);

    // If user is ADMIN, check they can only access their own merchant
    if (req.user.role === UserRole.ADMIN && id !== req.user.merchantId) {
      throw new ForbiddenException('You can only access your own merchant');
    }

    return merchant;
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete a merchant by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Merchant ID',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Merchant successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  async remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    // Only SUPERADMIN can delete merchants
    return this.merchantService.remove(id);
  }

  @Post(':id/binance-submerchant')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
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
  async createBinanceSubMerchant(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Request() req,
  ): Promise<Merchant> {
    // If user is ADMIN, check they can only access their own merchant
    if (req.user.role === UserRole.ADMIN && id !== req.user.merchantId) {
      throw new ForbiddenException('You can only manage your own merchant');
    }

    return this.merchantService.createBinanceSubMerchant(id);
  }
}
