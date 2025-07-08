import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

type ErrorType = {
  readonly name: string;
  readonly message: string;
  readonly httpStatus: any;
  readonly fields?: ReadonlyArray<string>;
  readonly code?: string;
};

type ExceptionParams<T extends ErrorType> = {
  [K in T['fields'][number]]: any;
};

type ExceptionArgs<T extends ErrorType> =
  T['fields'] extends ReadonlyArray<string> ? [T, ExceptionParams<T>] : [T];

export class Exception<T extends ErrorType> extends HttpException {
  @ApiProperty({
    example: 'ERROR_CODE',
    description: 'The error identifier code',
  })
  error: string;

  @ApiProperty({
    example: 404,
    description: 'Http status code of the error',
  })
  statusCode: number;

  @ApiProperty({
    example: 'Something not found',
    description: 'Detail of the error',
  })
  message: string;

  @ApiProperty({
    example: 'RESOURCE_NOT_FOUND',
    description: 'Error code for programmatic handling',
  })
  code?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Timestamp when the error occurred',
  })
  timestamp: string;

  constructor(...[exception, params]: ExceptionArgs<T>) {
    const errorMessage = exception.fields
      ? exception.fields.reduce(
          (acc, field) => acc.replace(`$${field}`, String(params[field])),
          exception.message,
        )
      : exception.message;

    super(
      {
        name: exception.name,
        message: errorMessage,
        httpStatus: exception.httpStatus,
        code: exception.code,
        timestamp: new Date().toISOString(),
      },
      exception.httpStatus,
    );

    this.error = exception.name;
    this.statusCode = exception.httpStatus;
    this.message = errorMessage;
    this.code = exception.code;
    this.timestamp = new Date().toISOString();
  }
}

// Predefined error types for common scenarios
export const CommonErrors = {
  RESOURCE_NOT_FOUND: {
    name: 'ResourceNotFound',
    message: 'Resource with ID $id not found',
    httpStatus: 404,
    fields: ['id'] as const,
    code: 'RESOURCE_NOT_FOUND',
  },
  VALIDATION_ERROR: {
    name: 'ValidationError',
    message: 'Validation failed for $field',
    httpStatus: 400,
    fields: ['field'] as const,
    code: 'VALIDATION_ERROR',
  },
  UNAUTHORIZED: {
    name: 'Unauthorized',
    message: 'Access denied. Invalid or missing authentication',
    httpStatus: 401,
    code: 'UNAUTHORIZED',
  },
  FORBIDDEN: {
    name: 'Forbidden',
    message: 'Insufficient permissions to access this resource',
    httpStatus: 403,
    code: 'FORBIDDEN',
  },
  CONFLICT: {
    name: 'Conflict',
    message: 'Resource conflict: $reason',
    httpStatus: 409,
    fields: ['reason'] as const,
    code: 'CONFLICT',
  },
  INTERNAL_ERROR: {
    name: 'InternalServerError',
    message: 'An internal server error occurred',
    httpStatus: 500,
    code: 'INTERNAL_ERROR',
  },
} as const;
