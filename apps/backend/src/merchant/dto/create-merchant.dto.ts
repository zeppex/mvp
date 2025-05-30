import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ example: 'Acme Store', description: 'Name of the merchant' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street, Springfield', description: 'Merchant address' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'contact@acme.com', description: 'Contact email of the merchant' })
  @IsString()
  contact: string;
}
