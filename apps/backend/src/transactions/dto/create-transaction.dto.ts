import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateTransactionDto {
  @ApiProperty({ example: 'PENDING', description: 'Transaction status' })
  @IsString()
  status: string;

  @ApiProperty({
    example: 'uuid-of-merchant',
    description: 'ID of the merchant',
  })
  @IsUUID()
  merchantId: UUID;

  @ApiProperty({ example: 'uuid-of-branch', description: 'ID of the branch' })
  @IsUUID()
  branchId: UUID;

  @ApiProperty({ example: 'uuid-of-pos', description: 'ID of the POS' })
  @IsUUID()
  posId: UUID;

  @ApiProperty({ example: '10.00', description: 'Transaction amount' })
  @IsString()
  amount: string;

  @ApiProperty({
    example: 'BINANCE_PAY',
    description: 'Exchange used for payment',
  })
  @IsString()
  exchange: string;

  @ApiProperty({
    example: 'Order for 2 lattes',
    description: 'Transaction description',
  })
  @IsString()
  description: string;
}
