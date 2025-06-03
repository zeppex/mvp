"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/types/enums";

interface WithAuthProps {
  requiredRoles?: UserRole[];
  loginUrl?: string;
}

/**
 * Higher-order component to protect routes that require authentication
 * @param Component The component to wrap with authentication
 * @param options Authentication options (roles, login url)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { requiredRoles = [], loginUrl = "/admin/login" } = options;

  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Check if user is authenticated
      if (!isLoggedIn()) {
        router.replace(loginUrl);
        return;
      }

      // Check if user has required role
      if (requiredRoles.length > 0) {
        const user = getCurrentUser();
        if (!user || !requiredRoles.includes(user.role as UserRole)) {
          router.replace(loginUrl);
          return;
        }
      }

      // User is authenticated and authorized
      setIsAuthorized(true);
      setLoading(false);
    }, [router]);

    // Show loading state while checking auth
    if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      );
    }

    // Only render the component if user is authorized
    return isAuthorized ? <Component {...props} /> : null;
  };
}
