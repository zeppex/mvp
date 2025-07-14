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
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new branch for the current merchant' })
  @ApiBody({ type: CreateBranchDto })
  @ApiResponse({
    status: 201,
    description: 'Branch successfully created.',
    type: Branch,
  })
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @Request() req,
  ): Promise<Branch> {
    const merchantId = req.user.merchantId;
    return this.branchService.create(merchantId, createBranchDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all branches for the current merchant' })
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
    @Request() req,
    @Query('includeDeactivated') includeDeactivated?: string,
  ): Promise<Branch[]> {
    const merchantId = req.user.merchantId;
    const includeDeactivatedBool = includeDeactivated === 'true';
    return this.branchService.findAll(merchantId, includeDeactivatedBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific branch by ID' })
  @ApiParam({
    name: 'id',
    description: 'ID of the branch',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the branch.',
    type: Branch,
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<Branch> {
    const merchantId = req.user.merchantId;
    return this.branchService.findOne(id, merchantId);
  }

  @Put(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a branch' })
  @ApiParam({
    name: 'id',
    description: 'ID of the branch',
    type: 'string',
  })
  @ApiBody({ type: UpdateBranchDto })
  @ApiResponse({
    status: 200,
    description: 'Branch successfully updated.',
    type: Branch,
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req,
  ): Promise<Branch> {
    const merchantId = req.user.merchantId;
    // Verify branch belongs to merchant before updating
    await this.branchService.findOne(id, merchantId);
    return this.branchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a branch' })
  @ApiParam({
    name: 'id',
    description: 'ID of the branch',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch successfully deactivated.',
  })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    const merchantId = req.user.merchantId;
    // Verify branch belongs to merchant before deleting
    await this.branchService.findOne(id, merchantId);
    return this.branchService.remove(id);
  }
}
