import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, Length, Matches } from 'class-validator';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

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
}
