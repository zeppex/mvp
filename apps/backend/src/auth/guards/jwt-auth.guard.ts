import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: any) {
    this.logger.debug(
      'JwtAuthGuard - Attempting to activate JWT authentication',
    );
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    this.logger.debug('JwtAuthGuard - Handling request:', {
      hasError: !!err,
      hasUser: !!user,
      info,
    });

    if (err) {
      this.logger.error('JwtAuthGuard - Authentication error:', err);
    }

    if (!user) {
      this.logger.error('JwtAuthGuard - No user found in request');
    }

    return super.handleRequest(err, user, info, context);
  }
}
