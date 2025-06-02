import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsOptional()
  isActive?: boolean;
}
