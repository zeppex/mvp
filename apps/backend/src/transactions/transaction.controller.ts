import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  ParseUUIDPipe,
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
} from '@nestjs/swagger';

@ApiTags('transactions')
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
  create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all transactions' })
  @ApiResponse({
    status: 200,
    description: 'Return all transactions.',
    type: [Transaction],
  })
  findAll(): Promise<Transaction[]> {
    return this.transactionService.findAll();
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
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Transaction> {
    return this.transactionService.findOne(id);
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
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.transactionService.remove(id);
  }
}
