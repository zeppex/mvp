import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The user password',
    example: 'StrongP@ssw0rd',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'The role of the user',
    enum: UserRole,
    example: 'tenant_admin',
    required: false,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'The ID of the tenant this user belongs to',
    example: '019730ab-7b64-7218-aad6-773cdcbb719f',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  tenantId?: string;
}
