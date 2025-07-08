import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

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
