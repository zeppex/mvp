import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    this.logger.debug(
      `RolesGuard: Checking roles for user ${user?.id} with roles ${user?.role}`,
    );
    if (!user || !user.role) {
      throw new ForbiddenException('User role not defined');
    }

    // SUPERADMIN has access to everything
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    // Check if the role is authorized
    const isRoleAuthorized = requiredRoles.includes(user.role);
    if (!isRoleAuthorized) {
      return false;
    }

    // For tenant-scoped roles, check tenant context
    if (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.ADMIN) {
      const requestTenantId = request.params.tenantId || request.body.tenantId || request.query.tenantId || request.tenantId;
      
      // If there's a tenant context in the request, ensure the user belongs to that tenant
      if (requestTenantId && user.tenantId && requestTenantId !== user.tenantId) {
        return false;
      }
    }

    return true;
  }
}
