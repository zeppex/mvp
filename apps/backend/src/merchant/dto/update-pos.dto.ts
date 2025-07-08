import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePosDto {
  @ApiProperty({
    example: 'POS 1',
    description: 'POS name',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  @IsString({ message: 'POS name must be a string' })
  @IsOptional()
  @Length(1, 100, {
    message: 'POS name must be between 1 and 100 characters',
  })
  name?: string;

  @ApiProperty({
    example: 'Main POS description',
    description: 'POS description',
    required: false,
    minLength: 1,
    maxLength: 500,
  })
  @IsString({ message: 'POS description must be a string' })
  @IsOptional()
  @Length(1, 500, {
    message: 'POS description must be between 1 and 500 characters',
  })
  description?: string;
}
