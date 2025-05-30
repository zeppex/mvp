import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Main Branch', description: 'Branch name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '456 Elm Street, Metropolis',
    description: 'Branch address',
  })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Primary contact name' })
  @IsString()
  contactName: string;

  @ApiProperty({ example: '+1234567890', description: 'Primary contact phone' })
  @IsString()
  contactPhone: string;
}
