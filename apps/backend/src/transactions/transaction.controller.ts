import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto';
import { Transaction } from './transaction.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UUID } from '../shared/types/uuid';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentTenant } from '../auth/decorators/tenant.decorator';

@ApiTags('transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully created.',
    type: Transaction,
  })
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentTenant() tenantId: UUID,
  ): Promise<Transaction> {
    return this.transactionService.create(dto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions.',
    type: [Transaction],
  })
  findAll(@CurrentTenant() tenantId: UUID): Promise<Transaction[]> {
    return this.transactionService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a transaction by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Return the transaction.',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @CurrentTenant() tenantId: UUID,
  ): Promise<Transaction> {
    return this.transactionService.findOne(id, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Transaction successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @CurrentTenant() tenantId: UUID,
  ): Promise<void> {
    return this.transactionService.remove(id, tenantId);
  }
}
