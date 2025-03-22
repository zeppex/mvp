import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export const ApiArrayProperty = (props: ApiPropertyOptions) => {
  return applyDecorators(
    ApiProperty({ ...props, isArray: true }),
    Transform(({ value }) => {
      if (Array.isArray(value)) {
        return value.map((_) => _.trim());
      } else if (typeof value == 'string') {
        return String(value)
          .split(',')
          .map((_) => _.trim());
      }
    }),
  );
};
