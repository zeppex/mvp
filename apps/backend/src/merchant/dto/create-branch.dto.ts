import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({
    example: 'Main Branch',
    description: 'Branch name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Branch name must be a string' })
  @IsNotEmpty({ message: 'Branch name is required' })
  @Length(2, 100, {
    message: 'Branch name must be between 2 and 100 characters',
  })
  name: string;

  @ApiProperty({
    example: '456 Elm Street, Metropolis',
    description: 'Branch address',
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Address is required' })
  @Length(5, 500, {
    message: 'Address must be between 5 and 500 characters',
  })
  address: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Primary contact name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Contact name must be a string' })
  @IsNotEmpty({ message: 'Contact name is required' })
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
  @IsNotEmpty({ message: 'Contact phone is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Contact phone must be a valid phone number (e.g., +1234567890)',
  })
  contactPhone: string;
}
