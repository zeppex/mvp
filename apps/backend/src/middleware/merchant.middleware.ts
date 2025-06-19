import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MerchantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = this.jwtService.verify(token);

        // Add user and merchant information to request object
        if (decoded) {
          if (decoded.merchantId) {
            req['merchantId'] = decoded.merchantId;
          }
          if (decoded.branchId) {
            req['branchId'] = decoded.branchId;
          }
          if (decoded.posId) {
            req['posId'] = decoded.posId;
          }
          if (decoded.role) {
            req['userRole'] = decoded.role;
          }
        }
      } catch (error) {
        // Token verification failed, continue without merchant info
      }
    }

    next();
  }
}
