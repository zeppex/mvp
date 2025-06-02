import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({ example: 'Acme Store', description: 'Name of the merchant' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '123 Main Street, Springfield',
    description: 'Merchant address',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Contact email of the merchant',
  })
  @IsString()
  contact: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Primary contact person name',
  })
  @IsString()
  contactName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Primary contact phone number',
  })
  @IsString()
  contactPhone: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the tenant this merchant belongs to',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}
