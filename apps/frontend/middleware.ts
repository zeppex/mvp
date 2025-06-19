import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Paths that should be protected by authentication
const protectedPaths = [
  "/admin/dashboard",
  "/merchant/dashboard",
];

// Paths that are exceptions (e.g., login pages)
const authPaths = ["/admin/login", "/merchant/login"];

// Debug and test paths that should be excluded from middleware
const excludedPaths = ["/auth-debug", "/auth-test", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for debug routes and API routes
  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the current path is protected
  const isPathProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if current path is an auth path (login pages)
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Get auth token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuthenticated = !!token;

  // For debugging
  console.log({
    pathname,
    isPathProtected,
    isAuthPath,
    isAuthenticated,
    token: !!token,
  });

  // If the path is protected and the user is not authenticated, redirect to login
  if (isPathProtected && !isAuthenticated) {
    const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginPath = pathname.startsWith("/admin")
      ? "/admin/login"
      : "/merchant/login";

    // Create url to redirect to
    const redirectUrl = new URL(
      `${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`,
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  }

  // If the user is authenticated and trying to access a login page, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    const dashboardPath = pathname.startsWith("/admin")
      ? "/admin/dashboard"
      : "/merchant/dashboard";
    const redirectUrl = new URL(dashboardPath, request.url);

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Protected paths - ensure all protected paths are properly matched
    "/admin/:path*", // This will protect all admin routes, including dashboard and tenants
    "/merchant/:path*",

    // Exclude specific paths that shouldn't be protected (if needed)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
