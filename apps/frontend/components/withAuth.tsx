"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isLoggedIn, getCurrentUser } from "@/lib/auth";
import { UserRole } from "@/lib/user-api";

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
    const [mounted, setMounted] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(true);

    useEffect(() => {
      console.log("Component mounted");
      setMounted(true);

      if (!isLoggedIn()) {
        console.log("User not logged in, redirecting...");
        setIsAuthorized(false);
        router.replace(loginUrl);
        return;
      }

      if (requiredRoles.length > 0) {
        const user = getCurrentUser();
        if (!user || !requiredRoles.includes(user.role as UserRole)) {
          console.log("User does not have required role, redirecting...");
          setIsAuthorized(false);
          router.replace(loginUrl);
          return;
        }
      }

      console.log("User is authorized");
    }, [router]);

    if (!mounted || !isAuthorized) {
      console.log("Rendering null due to mounted or isAuthorized state");
      return null;
    }

    console.log("Rendering component");
    return <Component {...props} />;
  };
}
