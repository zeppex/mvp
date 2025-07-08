import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, Length, Matches } from 'class-validator';
import { UUID } from 'crypto';
import { TransactionStatus } from '../../shared/enums/transactions.enum';
import { Exchange } from '../../shared/enums/exchange.enum';

export class CreateTransactionDto {
  @ApiProperty({
    example: TransactionStatus.PENDING,
    description: 'Transaction status',
    enum: Object.values(TransactionStatus),
  })
  @IsEnum(TransactionStatus, {
    message: 'Status must be a valid transaction status',
  })
  status: string;

  @ApiProperty({
    example: '019730ab-7b64-7218-aad6-773cdcbb719f',
    description: 'ID of the merchant',
  })
  @IsUUID('4', { message: 'Merchant ID must be a valid UUID' })
  merchantId: UUID;

  @ApiProperty({
    example: '019730ab-7b64-7218-aad6-773cdcbb719f',
    description: 'ID of the branch',
  })
  @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
  branchId: UUID;

  @ApiProperty({
    example: '019730ab-7b64-7218-aad6-773cdcbb719f',
    description: 'ID of the POS',
  })
  @IsUUID('4', { message: 'POS ID must be a valid UUID' })
  posId: UUID;

  @ApiProperty({
    example: '10.00',
    description: 'Transaction amount (decimal with up to 2 places)',
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsString({ message: 'Amount must be a string' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'Amount must be a valid decimal number with up to 2 decimal places',
  })
  amount: string;

  @ApiProperty({
    example: Exchange.BINANCE,
    description: 'Exchange used for payment',
    enum: Object.values(Exchange),
  })
  @IsEnum(Exchange, {
    message: 'Exchange must be a valid exchange type',
  })
  exchange: string;

  @ApiProperty({
    example: 'Order for 2 lattes',
    description: 'Transaction description',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @Length(1, 500, {
    message: 'Description must be between 1 and 500 characters',
  })
  description: string;
}
