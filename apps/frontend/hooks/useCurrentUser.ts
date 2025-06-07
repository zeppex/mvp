"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/enums";
import { useCallback } from "react";

interface UseCurrentUserOptions {
  redirectTo?: string;
  requiredRoles?: UserRole[];
}

/**
 * A hook to replace useAuth that uses Next Auth's session
 */
export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { redirectTo, requiredRoles = [] } = options;

  // User is authenticated when status is "authenticated"
  const authenticated = status === "authenticated";
  // User is not loading when status is not "loading"
  const loading = status === "loading";
  // Assume the component is mounted
  const mounted = true;

  // Check if user has required role(s)
  const hasRequiredRole = useCallback(() => {
    if (!requiredRoles.length || !session?.user?.role) {
      return true;
    }
    return requiredRoles.includes(session.user.role as UserRole);
  }, [requiredRoles, session?.user?.role]);

  // Handle redirects for unauthorized access or required roles
  const checkAndRedirect = useCallback(() => {
    if (redirectTo) {
      // Redirect if not authenticated
      if (status === "unauthenticated") {
        router.push(redirectTo);
        return;
      }

      // Redirect if user doesn't have required roles
      if (authenticated && requiredRoles.length > 0 && !hasRequiredRole()) {
        router.push(redirectTo);
      }
    }
  }, [
    authenticated,
    hasRequiredRole,
    redirectTo,
    requiredRoles.length,
    router,
    status,
  ]);

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: redirectTo || "/" });
  };

  return {
    user: session?.user || null,
    authenticated,
    loading,
    mounted,
    logout: handleLogout,
    checkAndRedirect,
    hasRequiredRole,
  };
}
