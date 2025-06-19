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
import { UserRole } from '../user/entities/user.entity';

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
    @Request() req,
  ): Promise<void> {
    // SUPERADMIN can delete all transactions, ADMIN can delete only their merchant's transactions
    const merchantId =
      req.user.role === UserRole.ADMIN ? req.user.merchantId : undefined;
    return this.transactionService.remove(id, merchantId);
  }
}
