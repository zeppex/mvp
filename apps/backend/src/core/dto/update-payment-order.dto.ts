import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  Length,
  Matches,
  IsObject,
} from 'class-validator';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';
import { ExchangeType } from '../entities/payment-order.entity';

export class UpdatePaymentOrderDto {
  @ApiProperty({
    example: '100.00',
    description: 'Order amount',
    required: false,
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsString({ message: 'Amount must be a string' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'Amount must be a valid decimal number with up to 2 decimal places',
  })
  amount?: string;

  @ApiProperty({
    example: 'Order for 2 lattes',
    description: 'Order description',
    required: false,
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @Length(1, 500, {
    message: 'Description must be between 1 and 500 characters',
  })
  description?: string;

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
