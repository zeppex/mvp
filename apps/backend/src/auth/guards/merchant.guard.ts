import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class MerchantGuard implements CanActivate {
  private readonly logger = new Logger(MerchantGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user, let the JWT guard handle authentication
    if (!user) {
      return true;
    }

    // SUPERADMIN has access to everything
    if (user.role === UserRole.SUPERADMIN) {
      return true;
    }

    // Extract IDs from request
    const requestedMerchantId = this.extractMerchantId(request);
    const requestedBranchId = this.extractBranchId(request);
    const requestedPosId = this.extractPosId(request);

    // Check merchant access (required for all non-SUPERADMIN users)
    if (requestedMerchantId) {
      if (user.merchantId !== requestedMerchantId) {
        throw new ForbiddenException('Access denied to this merchant');
      }
    }

    // Check branch access for BRANCH_ADMIN and CASHIER
    if (
      requestedBranchId &&
      (user.role === UserRole.BRANCH_ADMIN || user.role === UserRole.CASHIER)
    ) {
      if (user.branchId !== requestedBranchId) {
        throw new ForbiddenException('Access denied to this branch');
      }
    }

    // Check POS access for CASHIER
    if (requestedPosId && user.role === UserRole.CASHIER) {
      if (user.posId !== requestedPosId) {
        throw new ForbiddenException('Cashier can only access their own POS');
      }
    }

    return true;
  }

  private extractMerchantId(request: any): string | null {
    // Try to extract merchant ID from various sources
    const merchantId =
      request.params?.merchantId ||
      request.body?.merchantId ||
      request.query?.merchantId;

    // Only treat 'id' as merchant ID for specific routes that expect merchant ID
    // For branches/:id, pos/:id, etc., the 'id' is not a merchant ID
    const route = request.route?.path;
    if (
      route &&
      (route.includes('/merchants/') || route.includes('/admin/merchants/'))
    ) {
      return merchantId || request.params?.id || null;
    }

    return merchantId || null;
  }

  private extractBranchId(request: any): string | null {
    // Try to extract branch ID from various sources
    const branchId =
      request.params?.branchId ||
      request.body?.branchId ||
      request.query?.branchId;

    return branchId || null;
  }

  private extractPosId(request: any): string | null {
    // Try to extract POS ID from various sources
    const posId =
      request.params?.posId ||
      request.body?.posId ||
      request.query?.posId ||
      request.params?.id; // Sometimes the POS ID is just 'id' in the URL

    return posId || null;
  }
}
