import {
  IsString,
  IsUUID,
  IsOptional,
  IsEmail,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMerchantDto {
  @ApiProperty({
    example: 'Acme Store',
    description: 'Name of the merchant',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Merchant name must be a string' })
  @Length(2, 100, {
    message: 'Merchant name must be between 2 and 100 characters',
  })
  name: string;

  @ApiProperty({
    example: '123 Main Street, Springfield',
    description: 'Complete merchant address',
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Address must be a string' })
  @Length(5, 500, { message: 'Address must be between 5 and 500 characters' })
  address: string;

  @ApiProperty({
    example: 'contact@acme.com',
    description: 'Contact email of the merchant (must be valid email format)',
  })
  @IsString({ message: 'Contact must be a string' })
  @IsEmail({}, { message: 'Contact must be a valid email address' })
  contact: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Primary contact person name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Contact name must be a string' })
  @Length(2, 100, {
    message: 'Contact name must be between 2 and 100 characters',
  })
  contactName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Primary contact phone number (format: +1234567890)',
    pattern: '^\\+?[1-9]\\d{1,14}$',
  })
  @IsString({ message: 'Contact phone must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Contact phone must be a valid phone number (e.g., +1234567890)',
  })
  contactPhone: string;
}
