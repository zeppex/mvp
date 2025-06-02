import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'The unique name identifier for the tenant',
    example: 'acme-corp',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The display name of the tenant',
    example: 'Acme Corporation',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({
    description: 'Whether the tenant is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
