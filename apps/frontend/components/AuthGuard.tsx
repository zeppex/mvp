"use client";

import { ReactNode, useEffect, useState } from "react";
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
  const [authorized, setAuthorized] = useState(false);
  // Use state to avoid infinite re-renders from repeatedly calling these functions
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Only check auth state once
    if (authChecked) return;

    const loggedIn = isLoggedIn();
    const user = getCurrentUser();

    // If not logged in, redirect to login
    if (!loggedIn) {
      router.replace(redirectTo);
      return;
    }

    // If no specific roles are required, or user has no role, just check login status
    if (allowedRoles.length === 0 || !user?.role) {
      setAuthorized(true);
      setAuthChecked(true);
      return;
    }

    // If roles are required, check if user has one of them
    const hasAllowedRole = allowedRoles.includes(user.role as UserRole);
    if (!hasAllowedRole) {
      router.replace(redirectTo);
    } else {
      setAuthorized(true);
    }

    setAuthChecked(true);
  }, [allowedRoles, redirectTo, router, authChecked]);

  // Show nothing while checking auth state to avoid flashes of content
  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
