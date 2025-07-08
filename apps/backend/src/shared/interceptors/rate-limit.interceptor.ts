import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();
  private readonly config: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientId(request);

    if (!this.isAllowed(clientId)) {
      throw new HttpException(
        {
          message: 'Rate limit exceeded',
          error: 'Too Many Requests',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }

  private getClientId(request: Request): string {
    // Use IP address as client identifier
    // In production, you might want to use user ID or API key
    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  private isAllowed(clientId: string): boolean {
    const now = Date.now();
    const clientData = this.requestCounts.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      // First request or window expired
      this.requestCounts.set(clientId, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return true;
    }

    if (clientData.count >= this.config.maxRequests) {
      return false;
    }

    // Increment request count
    clientData.count++;
    return true;
  }

  // Cleanup expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [clientId, data] of this.requestCounts.entries()) {
      if (now > data.resetTime) {
        this.requestCounts.delete(clientId);
      }
    }
  }
}
