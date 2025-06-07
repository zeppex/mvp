"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/enums";

interface WithAuthProps {
  requiredRoles?: UserRole[];
  loginUrl?: string;
}

/**
 * Higher-order component to protect routes that require authentication using NextAuth
 * @param Component The component to wrap with authentication
 * @param options Authentication options (roles, login url)
 */
export function withNextAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { requiredRoles = [], loginUrl = "/admin/login" } = options;

  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
      // If loading, don't do anything yet
      if (status === "loading") return;

      // If not authenticated, redirect to login
      if (status === "unauthenticated") {
        router.replace(
          `${loginUrl}?returnUrl=${encodeURIComponent(
            window.location.pathname
          )}`
        );
        return;
      }

      // If authenticated but roles are required, check role
      if (requiredRoles.length > 0 && session?.user) {
        const userRole = session.user.role as UserRole;
        const hasAllowedRole = requiredRoles.includes(userRole);

        if (!hasAllowedRole) {
          console.log("User does not have required role, redirecting...");
          router.replace(loginUrl);
          return;
        }
      }
    }, [router, status, session]);

    // Show nothing while checking auth state or if not authenticated
    if (
      status !== "authenticated" ||
      (requiredRoles.length > 0 &&
        !requiredRoles.includes(session?.user?.role as UserRole))
    ) {
      return null;
    }

    return <Component {...props} />;
  };
}
