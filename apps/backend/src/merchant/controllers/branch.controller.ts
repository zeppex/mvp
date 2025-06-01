import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('branches')
@Controller('/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
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
  create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Body() createBranchDto: CreateBranchDto,
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
  @ApiResponse({
    status: 200,
    description: 'Return all branches.',
    type: [Branch],
  })
  findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
  ): Promise<Branch[]> {
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
  findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<Branch> {
    return this.branchService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a branch by ID for a merchant' })
  @ApiParam({
    name: 'merchantId',
    description: 'ID of the merchant',
    type: 'string',
  })
  @ApiParam({ name: 'id', description: 'Branch ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'Branch successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Branch not found.' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<void> {
    return this.branchService.remove(id);
  }
}
