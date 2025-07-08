import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    this.logger.debug('JWT Strategy - JWT_SECRET loaded:', {
      hasSecret: !!jwtSecret,
      secretLength: jwtSecret?.length,
      secretPreview: jwtSecret
        ? jwtSecret
        : 'undefined',
    });

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
  }

  async validate(payload: any) {
    this.logger.debug('JWT Strategy - Validating payload:', {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      merchantId: payload.merchantId,
      branchId: payload.branchId,
      posId: payload.posId,
    });

    if (!payload.sub || !payload.email || !payload.role) {
      this.logger.error('JWT Strategy - Invalid token payload:', payload);
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = {
      sub: payload.sub,
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      merchantId: payload.merchantId,
      branchId: payload.branchId,
      posId: payload.posId,
    };

    this.logger.debug('JWT Strategy - Returning user:', user);
    return user;
  }
}
