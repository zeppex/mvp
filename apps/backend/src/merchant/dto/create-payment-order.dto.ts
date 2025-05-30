import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDecimal } from 'class-validator';

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

  @ApiProperty({ example: 'PENDING', description: 'Order status' })
  @IsString()
  status: string;
}
