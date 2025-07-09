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
  Query,
} from '@nestjs/common';
import { BranchService } from '../services/branch.service';
import { CreateBranchDto, UpdateBranchDto } from '../dto';
import { Branch } from '../entities/branch.entity';
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MerchantGuard } from '../../auth/guards/merchant.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/entities/user.entity';

@ApiBearerAuth('access-token')
@ApiTags('branches')
@UseGuards(JwtAuthGuard, RolesGuard, MerchantGuard)
@Controller('merchants/:merchantId/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
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
    return this.branchService.create(merchantId, createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all branches for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiQuery({
    name: 'includeDeactivated',
    required: false,
    type: Boolean,
    description: 'Include deactivated branches in the response',
  })
  @ApiResponse({
    status: 200,
    description: 'Return all branches.',
    type: [Branch],
  })
  async findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Request() req,
    @Query('includeDeactivated') includeDeactivated?: string,
  ): Promise<Branch[]> {
    const includeDeactivatedBool = includeDeactivated === 'true';
    return this.branchService.findAll(merchantId, includeDeactivatedBool);
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
    const branch = await this.branchService.findOne(id);
    return branch;
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a branch by ID for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({ name: 'id', description: 'Branch ID', type: 'string' })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({
    status: 200,
    description: 'Return the updated branch.',
    type: Branch,
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req,
  ): Promise<Branch> {
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Deactivate a branch by ID for a merchant (soft delete)',
  })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({ name: 'id', description: 'Branch ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Branch successfully deactivated.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  @ApiResponse({ status: 403, description: 'Branch is already deactivated.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    return this.branchService.remove(id);
  }
}
