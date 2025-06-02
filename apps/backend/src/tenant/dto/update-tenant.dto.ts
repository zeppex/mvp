import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto {
  @ApiProperty({
    description: 'The display name of the tenant',
    example: 'Acme Corporation Updated',
    required: false,
  })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    description: 'Whether the tenant is active',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
