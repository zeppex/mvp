import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  private readonly logger = new Logger('ValidationPipe');

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Log incoming request data for debugging
    this.logger.debug('📥 Incoming request data:', JSON.stringify(value, null, 2));
    this.logger.debug('🎯 Expected DTO type:', metatype.name);

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    if (errors.length > 0) {
      // Enhanced error logging
      this.logger.error('❌ DTO Validation failed!');
      this.logger.error('📋 Expected DTO structure:', this.getExpectedStructure(metatype));
      this.logger.error('📨 Received data:', JSON.stringify(value, null, 2));
      this.logger.error('🚫 Validation errors:', this.formatValidationErrors(errors));

      // Log specific forbidden properties
      const forbiddenProperties = this.extractForbiddenProperties(errors);
      if (forbiddenProperties.length > 0) {
        this.logger.error('🔒 Forbidden properties detected:', forbiddenProperties);
        this.logger.error('💡 Hint: Remove these properties from your request or add them to the DTO');
      }

      // Log missing required properties
      const missingProperties = this.extractMissingProperties(errors);
      if (missingProperties.length > 0) {
        this.logger.error('📝 Missing required properties:', missingProperties);
        this.logger.error('💡 Hint: Add these properties to your request');
      }

      const errorMessage = this.formatErrorMessage(errors);
      throw new BadRequestException({
        message: 'Validation failed',
        errors: errorMessage,
        timestamp: new Date().toISOString(),
        expectedStructure: this.getExpectedStructure(metatype),
        receivedData: value,
      });
    }

    this.logger.log('✅ DTO validation successful for:', metatype.name);
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: any[]): any[] {
    return errors.map((error) => ({
      property: error.property,
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length > 0 ? this.formatValidationErrors(error.children) : undefined,
    }));
  }

  private extractForbiddenProperties(errors: any[]): string[] {
    const forbidden: string[] = [];
    errors.forEach((error) => {
      if (error.constraints?.whitelistValidation) {
        forbidden.push(error.property);
      }
    });
    return forbidden;
  }

  private extractMissingProperties(errors: any[]): string[] {
    const missing: string[] = [];
    errors.forEach((error) => {
      if (error.constraints && Object.keys(error.constraints).some(key => 
        key.includes('isDefined') || key.includes('isNotEmpty'))) {
        missing.push(error.property);
      }
    });
    return missing;
  }

  private formatErrorMessage(errors: any[]): string[] {
    return errors.map((error) => {
      const constraints = error.constraints;
      if (!constraints) return `${error.property} is invalid`;
      
      return Object.values(constraints).join(', ');
    });
  }

  private getExpectedStructure(metatype: any): any {
    try {
      // Get the prototype to extract property information
      const instance = new metatype();
      const properties = Object.getOwnPropertyNames(instance);
      
      // Get metadata from class-validator decorators if available
      const metadata = Reflect.getMetadata('class_validator:storage', metatype) || {};
      
      const structure: any = {};
      properties.forEach(prop => {
        structure[prop] = 'any'; // Default type
      });
      
      return structure;
    } catch (error) {
      return `Unable to extract structure for ${metatype.name}`;
    }
  }
}
