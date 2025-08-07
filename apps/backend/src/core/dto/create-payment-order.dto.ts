import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  Matches,
  IsUUID,
  IsObject,
} from 'class-validator';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';
import { ExchangeType } from '../entities/payment-order.entity';

export class CreatePaymentOrderDto {
  @ApiProperty({
    example: '100.00',
    description: 'Order amount (decimal with up to 2 places)',
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsString({ message: 'Amount must be a string' })
  @IsNotEmpty({ message: 'Amount is required' })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'Amount must be a valid decimal number with up to 2 decimal places',
  })
  amount: string;

  @ApiProperty({
    example: 'Order for 2 lattes',
    description: 'Order description',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @Length(1, 500, {
    message: 'Description must be between 1 and 500 characters',
  })
  description: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the POS terminal',
  })
  @IsUUID('4', { message: 'POS ID must be a valid UUID' })
  @IsNotEmpty({ message: 'POS ID is required' })
  posId: string;

  @ApiProperty({
    example: PaymentOrderStatus.PENDING,
    enum: PaymentOrderStatus,
    description: 'Order status',
    required: false,
  })
  @IsEnum(PaymentOrderStatus, {
    message: 'Status must be a valid payment order status',
  })
  @IsOptional()
  status?: PaymentOrderStatus;

  @ApiProperty({
    example: ExchangeType.BINANCE,
    enum: ExchangeType,
    description: 'Exchange type for the payment',
    required: false,
  })
  @IsEnum(ExchangeType, {
    message: 'Exchange must be a valid exchange type',
  })
  @IsOptional()
  exchange?: ExchangeType;

  @ApiProperty({
    example: { customerId: '12345', orderType: 'food' },
    description: 'Additional metadata for the payment order',
    required: false,
  })
  @IsObject({ message: 'Metadata must be an object' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: 'ext_tx_123456789',
    description: 'External transaction ID from the exchange',
    required: false,
  })
  @IsString({ message: 'External transaction ID must be a string' })
  @IsOptional()
  externalTransactionId?: string;

  @ApiProperty({
    example: 'Payment failed due to insufficient funds',
    description: 'Error message if payment failed',
    required: false,
  })
  @IsString({ message: 'Error message must be a string' })
  @IsOptional()
  errorMessage?: string;
}
