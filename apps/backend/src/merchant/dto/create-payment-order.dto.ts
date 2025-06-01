import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal, IsEnum, IsOptional } from 'class-validator';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';

export class CreatePaymentOrderDto {
  @ApiProperty({ example: '100.00', description: 'Order amount' })
  @IsString()
  amount: string;

  @ApiProperty({
    example: 'Order for 2 lattes',
    description: 'Order description',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: PaymentOrderStatus.PENDING,
    enum: PaymentOrderStatus,
    description: 'Order status',
  })
  @IsEnum(PaymentOrderStatus)
  @IsOptional()
  status?: PaymentOrderStatus;
}
