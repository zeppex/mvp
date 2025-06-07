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
  // Initialize with null values for SSR compatibility
  const [user, setUser] = useState<User | null>(null);
  // Start with false for loading during SSR to prevent hydration mismatch
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const { redirectTo, requiredRoles = [] } = options;

  // Function to handle token refresh
  const handleTokenRefresh = useCallback(async () => {
    if (typeof window === "undefined") return true;

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

  // Check authentication status on mount, but only on the client
  useEffect(() => {
    setMounted(true);
    setLoading(true);

    // Only check auth on the client side
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
    // Only set up refresh monitoring if user is authenticated
    if (!authenticated) return;

    // Check token status every minute
    const refreshInterval = setInterval(() => {
      handleTokenRefresh();
    }, 60000); // 1 minute

    // Also refresh immediately on mount if needed
    if (isTokenExpiringSoon()) {
      handleTokenRefresh();
    }

    return () => {
      clearInterval(refreshInterval);
    };
  }, [handleTokenRefresh, authenticated]);

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
    mounted,
    logout: handleLogout,
    refreshToken: handleTokenRefresh,
  };
}
