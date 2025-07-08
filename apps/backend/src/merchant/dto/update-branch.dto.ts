import { IsString, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBranchDto {
  @ApiProperty({
    example: 'Main Branch',
    description: 'Branch name',
    required: false,
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Branch name must be a string' })
  @IsOptional()
  @Length(2, 100, {
    message: 'Branch name must be between 2 and 100 characters',
  })
  name?: string;

  @ApiProperty({
    example: '456 Elm Street, Metropolis',
    description: 'Branch address',
    required: false,
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Address must be a string' })
  @IsOptional()
  @Length(5, 500, {
    message: 'Address must be between 5 and 500 characters',
  })
  address?: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Primary contact name',
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
