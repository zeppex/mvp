# Role-Based Access Control (RBAC) and Multi-Tenant Architecture

## User Roles and Permissions

The system implements a hierarchical role-based access control system with the following roles:

1. **SUPERADMIN**
   - Can create tenants
   - Can create/update/delete users of any role
   - Has full access to all system resources and operations
   - Is the highest level of access in the system

2. **ADMIN**
   - Can view all tenants
   - Can create users for any tenant (except SUPERADMIN users)
   - Has access to most system resources but cannot create tenants
   - Has limited access to system-wide configuration

3. **TENANT_ADMIN**
   - Can only manage resources for their assigned tenant
   - Can create/update/delete users within their own tenant (except other TENANT_ADMINs)
   - Cannot create other TENANT_ADMINs
   - Can create and manage merchants, branches, and POSs for their tenant

4. **MERCHANT_ADMIN**
   - Can only manage resources for their assigned merchant
   - Limited to operations within their merchant scope

5. **BRANCH_ADMIN**
   - Can only manage resources for their assigned branch
   - Limited to operations within their branch scope

6. **POS_USER**
   - Most restricted role with access limited to POS operations
   - Can only perform operations on assigned POS terminals

## Tenant Isolation

The system enforces strong tenant isolation through multiple mechanisms:

1. **JWT Token Enforcement**
   - User authentication tokens contain tenantId and role
   - Used by middleware to establish tenant context

2. **Role-Based Guards**
   - Custom `RolesGuard` checks both role permissions and tenant context
   - Prevents cross-tenant access attempts

3. **Service-Level Access Control**
   - All services enforce tenant-specific restrictions
   - Database queries filter resources by tenant

4. **Controller-Level Authorization**
   - All controllers validate tenant context before operations
   - Explicit tenant validation in all endpoints

## Cross-Cutting Concerns

1. **Tenant Middleware**
   - Extracts tenant context from JWT tokens
   - Makes tenant information available to all request handlers

2. **Error Handling**
   - Clear ForbiddenException messages for unauthorized actions
   - Detailed logging of access violations

## Implementation Guidelines

When implementing new features:

1. All controllers must extend proper role-based guards
2. Service methods should always validate tenant context
3. Database queries should always filter by tenant where appropriate
4. Use the established permission hierarchy for new features
5. Consider both role permissions AND tenant context in all authorization decisions

## Security Considerations

1. NEVER bypass tenant isolation for non-SUPERADMIN users
2. Always ensure JWTs cannot be manipulated to bypass tenant restrictions
3. Apply principle of least privilege when assigning roles
4. Audit logs should track all permission-related actions
