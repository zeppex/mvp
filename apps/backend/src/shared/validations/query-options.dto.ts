import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsPositive, IsOptional, IsNumber, Min } from 'class-validator';

export enum OrderDirectionType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationOptionsQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiProperty({ default: 0, required: false })
  offset?: number = 0;

  @Type(() => Number)
  @IsPositive()
  @IsOptional()
  @ApiProperty({ default: 50, required: false })
  limit?: number = 50;
}

export interface OrderQueryOptions {
  orderDirection: OrderDirectionType;
  orderField: string;
}

export interface IncludesQueryOptions {
  includes: string[];
}

export class PaginationResponseMapper {
  static toDto(data: any[], total: number, offset?: number, limit?: number) {
    return {
      meta: {
        total,
        offset,
        limit,
        length: data.length,
      },
      data,
    };
  }
}
