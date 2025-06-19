import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'very-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    return {
      sub: payload.sub,
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      merchantId: payload.merchantId,
      branchId: payload.branchId,
      posId: payload.posId,
    };
  }
}
