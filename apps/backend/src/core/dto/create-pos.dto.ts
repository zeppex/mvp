import {
  IsString,
  IsNotEmpty,
  Length,
  IsUUID,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePosDto {
  @ApiProperty({
    example: 'POS 1',
    description: 'POS name',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'POS name must be a string' })
  @IsNotEmpty({ message: 'POS name is required' })
  @Length(1, 100, {
    message: 'POS name must be between 1 and 100 characters',
  })
  name: string;

  @ApiProperty({
    example: 'Main POS description',
    description: 'POS description',
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'POS description must be a string' })
  @IsNotEmpty({ message: 'POS description is required' })
  @Length(1, 500, {
    message: 'POS description must be between 1 and 500 characters',
  })
  description: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the branch this POS belongs to',
  })
  @IsUUID('4', { message: 'Branch ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;

  @ApiProperty({
    example: 'e95d0a67-b57b-4c57-b0c0-70bf93d6f50c',
    description: 'Merchant ID (required for superadmin, optional for admin)',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'Merchant ID must be a valid UUID' })
  merchantId?: string;
}
