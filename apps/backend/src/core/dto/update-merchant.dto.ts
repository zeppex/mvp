import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMerchantDto {
  @ApiProperty({
    example: 'Acme Store',
    description: 'Name of the merchant',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Merchant name must be a string' })
  @IsOptional()
  @Length(2, 100, {
    message: 'Merchant name must be between 2 and 100 characters',
  })
  name?: string;

  @ApiProperty({
    example: '123 Main Street, Springfield',
    description: 'Complete merchant address',
    required: false,
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  @Length(5, 500, { message: 'Address must be between 5 and 500 characters' })
  address?: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Contact email of the merchant (must be valid email format)',
    required: false,
  })
  @IsString({ message: 'Contact must be a string' })
  @IsEmail({}, { message: 'Contact must be a valid email address' })
  @IsOptional()
  contact?: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Primary contact person name',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Contact name must be a string' })
  @IsOptional()
  @Length(2, 100, {
    message: 'Contact name must be between 2 and 100 characters',
  })
  contactName?: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Primary contact phone number (format: +1234567890)',
    required: false,
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsString({ message: 'Contact phone must be a string' })
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Contact phone must be a valid phone number (e.g., +1234567890)',
  })
  contactPhone?: string;
}
