"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import { isLoggedIn, getCurrentUser, logout, isTokenExpiringSoon, refreshToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types/enums";

interface UseAuthOptions {
  redirectTo?: string;
  requiredRoles?: UserRole[];
}

export function useAuth(options: UseAuthOptions = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  const { redirectTo, requiredRoles = [] } = options;

  // Function to handle token refresh
  const handleTokenRefresh = useCallback(async () => {
    if (isTokenExpiringSoon() && authenticated) {
      try {
        const refreshResponse = await refreshToken();
        if (refreshResponse && refreshResponse.user) {
          setUser(refreshResponse.user);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
      }
    }
    return true;
  }, [authenticated]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = isLoggedIn();
        const currentUser = getCurrentUser();

        setAuthenticated(isAuthenticated);
        setUser(currentUser);

        // If redirect path is specified and user is not authenticated, redirect
        if (redirectTo && !isAuthenticated) {
          router.push(redirectTo);
          return;
        }

        // If required roles are specified and user doesn't have one of them, redirect
        if (isAuthenticated && requiredRoles.length > 0) {
          const hasRequiredRole =
            currentUser && requiredRoles.includes(currentUser.role as UserRole);

          if (!hasRequiredRole && redirectTo) {
            router.push(redirectTo);
            return;
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [redirectTo, requiredRoles, router]);

  // Set up interval to refresh token
  useEffect(() => {
    // Check token status every minute
    const refreshInterval = setInterval(() => {
      handleTokenRefresh();
    }, 60000); // 1 minute

    // Also refresh immediately on mount if needed
    handleTokenRefresh();

    return () => {
      clearInterval(refreshInterval);
    };
  }, [handleTokenRefresh]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setAuthenticated(false);
    setUser(null);

    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return {
    user,
    authenticated,
    loading,
    logout: handleLogout,
    refreshToken: handleTokenRefresh,
  };
}
