import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto';
import { Transaction, TransactionStatus } from './transaction.entity';
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
import { UserRole } from '../user/entities/user.entity';
import { IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// DTO for completing transactions
class CompleteTransactionDto {
  @ApiProperty({
    description: 'New transaction status',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;
}

// DTO for bulk completion
class CompleteMultipleTransactionsDto {
  @ApiProperty({
    description: 'Array of transaction IDs to complete',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  transactionIds: UUID[];
}

@ApiTags('transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction successfully created.',
    type: Transaction,
  })
  create(
    @Body() dto: CreateTransactionDto,
    @Request() req,
  ): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Post('completed')
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({
    summary: 'Create a completed transaction with token minting',
  })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description:
      'Completed transaction successfully created with tokens minted.',
    type: Transaction,
  })
  createCompleted(
    @Body() dto: CreateTransactionDto,
    @Request() req,
  ): Promise<Transaction> {
    return this.transactionService.createCompleted(dto);
  }

  @Patch(':id/complete')
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Complete a transaction and mint tokens' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction completed and tokens minted.',
    type: Transaction,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  complete(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<Transaction> {
    // SUPERADMIN can complete all transactions, ADMIN can complete only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.updateStatus(
      id,
      TransactionStatus.COMPLETED,
      merchantId,
    );
  }

  @Post('complete-multiple')
  @Roles(
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  )
  @ApiOperation({ summary: 'Complete multiple transactions and mint tokens' })
  @ApiBody({ type: CompleteMultipleTransactionsDto })
  @ApiResponse({
    status: 200,
    description: 'Transactions completed and tokens minted.',
    type: [Transaction],
  })
  completeMultiple(
    @Body() dto: CompleteMultipleTransactionsDto,
    @Request() req,
  ): Promise<Transaction[]> {
    // SUPERADMIN can complete all transactions, ADMIN can complete only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.completeMultipleTransactions(
      dto.transactionIds,
      merchantId,
    );
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions.',
    type: [Transaction],
  })
  findAll(@Request() req): Promise<Transaction[]> {
    // SUPERADMIN can see all transactions, ADMIN can see only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.findAll(merchantId);
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
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
    @Request() req,
  ): Promise<Transaction> {
    // SUPERADMIN can see all transactions, ADMIN can see only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.findOne(id, merchantId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a transaction by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Transaction ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'Transaction successfully cancelled.',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: UUID,
    @Request() req,
  ): Promise<void> {
    // SUPERADMIN can cancel all transactions, ADMIN can cancel only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.remove(id, merchantId);
  }
}
