import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PosService } from './pos.service';
import { CreatePosDto } from './dto';
import { Pos } from './pos.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UUID } from 'crypto';

@ApiTags('pos')
@Controller('merchants/:merchantId/branches/:branchId/pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new POS for a branch' })
  @ApiParam({ name: 'merchantId', description: 'ID of the merchant', type: 'string' })
  @ApiParam({ name: 'branchId', description: 'ID of the branch', type: 'string' })
  @ApiBody({ type: CreatePosDto })
  @ApiResponse({ status: 201, description: 'POS successfully created.', type: Pos })
  create(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Body() createPosDto: CreatePosDto,
  ): Promise<Pos> {
    return this.posService.create(merchantId, branchId, createPosDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all POS for a branch' })
  @ApiParam({ name: 'merchantId', description: 'ID of the merchant', type: 'string' })
  @ApiParam({ name: 'branchId', description: 'ID of the branch', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return all POS.', type: [Pos] })
  findAll(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
  ): Promise<Pos[]> {
    return this.posService.findAll(merchantId, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a POS by ID for a branch' })
  @ApiParam({ name: 'merchantId', description: 'ID of the merchant', type: 'string' })
  @ApiParam({ name: 'branchId', description: 'ID of the branch', type: 'string' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Return the POS.', type: Pos })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  findOne(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<Pos> {
    return this.posService.findOne(merchantId, branchId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a POS by ID for a branch' })
  @ApiParam({ name: 'merchantId', description: 'ID of the merchant', type: 'string' })
  @ApiParam({ name: 'branchId', description: 'ID of the branch', type: 'string' })
  @ApiParam({ name: 'id', description: 'POS ID', type: 'string' })
  @ApiResponse({ status: 204, description: 'POS successfully deleted.' })
  @ApiResponse({ status: 404, description: 'POS not found.' })
  remove(
    @Param('merchantId', new ParseUUIDPipe()) merchantId: UUID,
    @Param('branchId', new ParseUUIDPipe()) branchId: UUID,
    @Param('id', new ParseUUIDPipe()) id: UUID,
  ): Promise<void> {
    return this.posService.remove(merchantId, branchId, id);
  }
}
