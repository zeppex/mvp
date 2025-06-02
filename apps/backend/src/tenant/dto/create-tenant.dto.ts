import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
