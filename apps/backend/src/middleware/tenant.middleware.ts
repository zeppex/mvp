import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = this.jwtService.verify(token);

        // Add tenant information to request object
        if (decoded && decoded.tenantId) {
          req['tenantId'] = decoded.tenantId;
        }
      } catch (error) {
        // Token verification failed, continue without tenant info
      }
    }

    next();
  }
}
