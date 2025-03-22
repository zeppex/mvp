import { applyDecorators } from '@nestjs/common';
import { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface';
import { ApiArrayProperty } from './api-array-property.decorator';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderDirectionType } from './query-options.dto';

interface Metadata {
  type: SchemaObjectMetadata['type'];
}

export const ApiIncludesProperty = (metadata: Metadata) => {
  return applyDecorators(
    IsOptional(),
    ApiPropertyOptional(),
    ApiArrayProperty(metadata),
    IsIn(Object.values(metadata.type), { each: true }),
  );
};

export const ApiOrderDirectionProperty = () => {
  return applyDecorators(
    IsOptional(),
    ApiPropertyOptional({
      enum: OrderDirectionType,
      default: null,
    }),
    IsIn(Object.values(OrderDirectionType)),
  );
};

export const ApiOrderFieldProperty = (type: any) => {
  return applyDecorators(
    IsOptional(),
    ApiPropertyOptional({
      enum: type,
      default: null,
    }),
    IsIn(Object.values(type)),
  );
};
