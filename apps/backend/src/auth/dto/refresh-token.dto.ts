import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token to use for generating a new access token',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
