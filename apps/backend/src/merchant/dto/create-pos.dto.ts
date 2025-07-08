import { IsString, IsNotEmpty, Length } from 'class-validator';
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
}
