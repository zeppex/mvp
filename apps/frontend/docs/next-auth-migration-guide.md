# Next Auth Migration Guide

This guide documents the migration from the custom authentication system to Next Auth in the Zeppex Frontend.

## Overview

We've replaced the custom auth system with Next Auth to simplify authentication, improve security, and leverage a well-maintained authentication library. This migration involved:

1. Installing Next Auth
2. Setting up NextAuth configuration
3. Creating compatibility tools to ease migration
4. Updating protected routes and components
5. Updating auth-dependent API services

## Changes Made

### Core Auth Files

- Created `/app/api/auth/[...nextauth]/route.ts` - Next Auth API routes
- Created `/lib/auth-config.ts` - Next Auth configuration
- Created `/types/next-auth.d.ts` - Type declarations for Next Auth
- Created `/lib/auth-utils.ts` - Server-side auth utilities
- Created `/components/auth/AuthProvider.tsx` - Next Auth Provider wrapper

### Compatibility Tools

These components were created to make migration from the custom auth system to Next Auth easier:

- Created `/hooks/useCurrentUser.ts` - Hook that provides similar API to the old `useAuth` hook
- Created `/components/withNextAuth.tsx` - HOC that replaces `withAuth` with similar API

### Updated API Services

- Created `/lib/axios-next-auth.ts` - Updated axios interceptor to use Next Auth sessions
- Updated API services to use the Next Auth axios client

### Updated Pages and Components

The following pages and components have been updated to use Next Auth:

- `/app/admin/dashboard/page.tsx`
- `/app/admin/login/page.tsx`
- `/app/admin/tenants/page.tsx`
- `/app/admin/tenants/create/page.tsx`
- `/app/admin/tenants/edit/[id]/page.tsx`
- `/app/admin/tenants/[id]/users/page.tsx`
- `/app/admin/tenants/[id]/users/create/page.tsx`
- `/app/admin/tenants/[id]/users/edit/[userId]/page.tsx`
- `/app/merchant/dashboard/page.tsx`
- `/components/NavBar.tsx`
- `/components/admin/TenantForm.tsx`
- `/components/admin/UserForm.tsx`
- `/components/auth/AuthTester.tsx`

## How to Migrate More Pages

To migrate additional pages from the custom auth system to Next Auth, follow these steps:

### For Client Components:

1. Replace import `import { withAuth } from "@/components/withAuth";` with `import { withNextAuth } from "@/components/withNextAuth";`
2. Update UserRole import to use types: `import { UserRole } from "@/types/enums";`
3. Rename your component to `[Name]Content` (e.g., `PageNameContent`)
4. Replace the export:

```typescript
// OLD
export default withAuth(PageName, {
  requiredRoles: [UserRole.ROLE1, UserRole.ROLE2],
});

// NEW
const PageName = withNextAuth(PageNameContent, {
  requiredRoles: [UserRole.ROLE1, UserRole.ROLE2],
  loginUrl: "/admin/login", // or "/merchant/login"
});

export default PageName;
```

### For API Calls:

1. Update API imports to use `axios-next-auth.ts` instead of `axios.ts`
2. Remove any manual token handling as Next Auth will handle this automatically

### For Accessing User Info:

1. Replace `useAuth()` with `useCurrentUser()`
2. Replace `getCurrentUser()` with `useSession()` from next-auth/react
3. Access the user via `session?.user` instead of `user`

## Files Needing Cleanup

Once all pages have been migrated, the following files can be removed:

- `/lib/auth.ts`
- `/lib/cookies.ts`
- `/lib/server-auth.ts`
- `/components/AuthGuard.tsx`
- `/components/withAuth.tsx`
- `/hooks/useAuth.ts`
- `/app/api/auth/login/route.ts`
- `/app/api/auth/logout/route.ts`
- `/app/api/auth/refresh/route.ts`

## Testing Authentication

Use the `AuthTester` component to verify that Next Auth is working correctly:

```tsx
import AuthTester from "@/components/auth/AuthTester";

// In your component
return (
  <div>
    <AuthTester />
    {/* Other content */}
  </div>
);
```
