import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePosDto {
  @ApiProperty({ example: 'POS 1', description: 'POS name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Main POS description', description: 'POS description' })
  @IsString()
  description: string;
}
