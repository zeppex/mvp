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
import { BranchService } from '../services/branch.service';
import { CreateBranchDto } from '../dto';
import { Branch } from '../entities/branch.entity';
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
@ApiTags('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a new branch for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({
    status: 201,
    description: 'Branch successfully created.',
    type: Branch,
  })
  async create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Body() createBranchDto: CreateBranchDto,
    @Request() req,
  ): Promise<Branch> {
    // For TENANT_ADMIN, verify that the merchant belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      // Verify that the merchant belongs to the tenant admin's tenant
      const isMerchantFromTenant =
        await this.branchService.isMerchantFromTenant(
          merchantId,
          req.user.tenantId,
        );

      if (!isMerchantFromTenant) {
        throw new ForbiddenException(
          'You can only create branches for merchants in your tenant',
        );
      }
    }

    return this.branchService.create(merchantId, createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all branches for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all branches.',
    type: [Branch],
  })
  async findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Request() req,
  ): Promise<Branch[]> {
    // For TENANT_ADMIN, verify that the merchant belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isMerchantFromTenant =
        await this.branchService.isMerchantFromTenant(
          merchantId,
          req.user.tenantId,
        );

      if (!isMerchantFromTenant) {
        throw new ForbiddenException(
          'You can only access branches for merchants in your tenant',
        );
      }
    }

    return this.branchService.findAll(merchantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a branch by ID for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({ name: 'id', description: 'Branch ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the branch.', type: Branch })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<Branch> {
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        id,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only access branches in your tenant',
        );
      }
    }

    return this.branchService.findOne(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Delete a branch by ID for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({ name: 'id', description: 'Branch ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Branch successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    // For TENANT_ADMIN, verify that the branch belongs to their tenant
    if (req.user.role === UserRole.TENANT_ADMIN) {
      const isBranchFromTenant = await this.branchService.isBranchFromTenant(
        id,
        req.user.tenantId,
      );

      if (!isBranchFromTenant) {
        throw new ForbiddenException(
          'You can only delete branches in your tenant',
        );
      }
    }

    return this.branchService.remove(id);
  }
}
