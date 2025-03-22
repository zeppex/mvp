import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

type ErrorType = {
  readonly name: string;
  readonly message: string;
  readonly httpStatus: any;
  readonly fields?: ReadonlyArray<string>;
};

type ExceptionParams<T extends ErrorType> = {
  [K in T['fields'][number]]: any;
};

type ExceptionArgs<T extends ErrorType> = T['fields'] extends ReadonlyArray<string> ? [T, ExceptionParams<T>] : [T];

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

  constructor(...[exception, params]: ExceptionArgs<T>) {
    super(
      {
        name: exception.name,
        message: exception.fields
          ? exception.fields.reduce((acc, field) => acc.replace(`$${field}`, String(params[field])), exception.message)
          : exception.message,
        httpStatus: exception.httpStatus,
      },
      exception.httpStatus,
    );
  }
}
