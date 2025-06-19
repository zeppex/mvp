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

    // For merchant-scoped roles, check merchant context
    if (user.role !== UserRole.SUPERADMIN) {
      const requestMerchantId =
        request.params.merchantId ||
        request.body.merchantId ||
        request.query.merchantId ||
        request.merchantId;
      const requestBranchId =
        request.params.branchId ||
        request.body.branchId ||
        request.query.branchId ||
        request.branchId;

      // If there's a merchant context in the request, ensure the user belongs to that merchant
      if (
        requestMerchantId &&
        user.merchantId &&
        requestMerchantId !== user.merchantId
      ) {
        return false;
      }

      // If there's a branch context in the request and user is branch-scoped, ensure they belong to that branch
      if (
        requestBranchId &&
        user.role === UserRole.BRANCH_ADMIN &&
        user.branchId &&
        requestBranchId !== user.branchId
      ) {
        return false;
      }

      // If user is a cashier, they can only access their own resources
      if (user.role === UserRole.CASHIER) {
        const requestUserId = request.params.id || request.params.userId;
        if (requestUserId && requestUserId !== user.sub) {
          return false;
        }
      }
    }

    return true;
  }
}
