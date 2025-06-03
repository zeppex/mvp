"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/types/enums";

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export function AuthGuard({
  children,
  allowedRoles = [],
  redirectTo = "/admin/login",
}: AuthGuardProps) {
  const router = useRouter();
  const loggedIn = isLoggedIn();
  const user = getCurrentUser();

  useEffect(() => {
    // If not logged in, redirect to login
    if (!loggedIn) {
      router.replace(redirectTo);
      return;
    }

    // If no specific roles are required, or user has no role, just check login status
    if (allowedRoles.length === 0 || !user?.role) {
      return;
    }

    // If roles are required, check if user has one of them
    const hasAllowedRole = allowedRoles.includes(user.role as UserRole);
    if (!hasAllowedRole) {
      router.replace(redirectTo);
    }
  }, [loggedIn, user, allowedRoles, redirectTo, router]);

  // Show nothing while checking auth state to avoid flashes of content
  if (!loggedIn || (allowedRoles.length > 0 && !user?.role)) {
    return null;
  }

  return <>{children}</>;
}
