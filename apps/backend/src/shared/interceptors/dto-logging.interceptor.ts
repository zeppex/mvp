import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class DtoLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('DTOLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const contentType = headers['content-type'] || '';

    const timestamp = new Date().toISOString();
    const contextClass = context.getClass().name;
    const methodName = context.getHandler().name;

    // Log incoming request details
    this.logger.log('📡 Incoming Request Details:');
    this.logger.log(`   🕐 Timestamp: ${timestamp}`);
    this.logger.log(`   🎯 Endpoint: ${method} ${url}`);
    this.logger.log(`   🏷️  Controller: ${contextClass}.${methodName}`);
    this.logger.log(`   📱 User-Agent: ${userAgent}`);
    this.logger.log(`   📄 Content-Type: ${contentType}`);
    
    if (body && Object.keys(body).length > 0) {
      this.logger.log('📦 Request Body:');
      this.logger.log(JSON.stringify(body, null, 2));
      
      // Analyze the structure
      this.analyzeRequestStructure(body, methodName);
    } else {
      this.logger.log('📦 Request Body: (empty)');
    }

    // Log query parameters if any
    if (request.query && Object.keys(request.query).length > 0) {
      this.logger.log('🔍 Query Parameters:');
      this.logger.log(JSON.stringify(request.query, null, 2));
    }

    // Log path parameters if any
    if (request.params && Object.keys(request.params).length > 0) {
      this.logger.log('🔗 Path Parameters:');
      this.logger.log(JSON.stringify(request.params, null, 2));
    }

    const now = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        const responseTime = Date.now() - now;
        this.logger.log(`✅ Request completed successfully in ${responseTime}ms`);
        
        if (responseData) {
          this.logger.debug('📤 Response Data:');
          this.logger.debug(JSON.stringify(responseData, null, 2));
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(`❌ Request failed after ${responseTime}ms`);
        this.logger.error('💥 Error details:', error.message);
        
        if (error.response) {
          this.logger.error('🔍 Error response:', JSON.stringify(error.response, null, 2));
        }
        
        // Log additional context for validation errors
        if (error.message?.includes('Validation failed') || error.status === 400) {
          this.logger.error('🚨 Potential DTO validation issue detected!');
          this.logger.error('📋 Original request body:', JSON.stringify(body, null, 2));
          this.logValidationHints(body, methodName);
        }
        
        return throwError(() => error);
      }),
    );
  }

  private analyzeRequestStructure(body: any, methodName: string): void {
    this.logger.debug('🔬 Analyzing request structure:');
    
    const bodyKeys = Object.keys(body);
    const bodyValues = Object.values(body);
    
    this.logger.debug(`   📊 Number of fields: ${bodyKeys.length}`);
    this.logger.debug(`   🔑 Field names: [${bodyKeys.join(', ')}]`);
    
    // Analyze field types
    const fieldTypes: { [key: string]: string } = {};
    bodyKeys.forEach(key => {
      const value = body[key];
      fieldTypes[key] = this.getFieldType(value);
    });
    
    this.logger.debug('   🏷️  Field types:');
    Object.entries(fieldTypes).forEach(([key, type]) => {
      this.logger.debug(`      ${key}: ${type}`);
    });
    
    // Check for common DTO patterns
    this.checkCommonPatterns(body, methodName);
  }

  private getFieldType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return `string(${value.length})`;
    return typeof value;
  }

  private checkCommonPatterns(body: any, methodName: string): void {
    const keys = Object.keys(body);
    
    // Check for common problematic fields
    const problematicFields = ['isActive', 'createdAt', 'updatedAt', 'id'];
    const foundProblematic = keys.filter(key => problematicFields.includes(key));
    
    if (foundProblematic.length > 0) {
      this.logger.warn('⚠️  Potentially problematic fields detected:');
      foundProblematic.forEach(field => {
        this.logger.warn(`   🚫 ${field}: This field might not be allowed in DTOs`);
      });
    }
    
    // Check for missing common required fields based on method
    if (methodName === 'create') {
      const commonRequired = ['name'];
      const missing = commonRequired.filter(field => !keys.includes(field));
      if (missing.length > 0) {
        this.logger.warn('⚠️  Possibly missing required fields:');
        missing.forEach(field => {
          this.logger.warn(`   📝 ${field}: Commonly required for creation`);
        });
      }
    }
  }

  private logValidationHints(body: any, methodName: string): void {
    this.logger.error('💡 DTO Validation Troubleshooting Hints:');
    
    if (methodName === 'create') {
      this.logger.error('   For CREATE operations, ensure your DTO only includes:');
      this.logger.error('   ✅ Required fields (name, contact info, etc.)');
      this.logger.error('   ❌ Avoid: id, createdAt, updatedAt, isActive (unless explicitly allowed)');
    }
    
    if (methodName === 'update') {
      this.logger.error('   For UPDATE operations, ensure your DTO only includes:');
      this.logger.error('   ✅ Optional updatable fields');
      this.logger.error('   ❌ Avoid: id, createdAt, updatedAt (unless explicitly allowed)');
    }
    
    this.logger.error('   📚 Check your DTO class for @IsString(), @IsEmail(), etc. decorators');
    this.logger.error('   🔒 Ensure ValidationPipe whitelist settings match your DTO structure');
  }
}
