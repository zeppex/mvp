import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSideTokens } from './lib/server-auth';

// Paths that should be protected by authentication
const protectedPaths = [
  '/admin/dashboard',
  '/merchant/dashboard',
];

// Paths that are exceptions (e.g., login pages)
const authPaths = [
  '/admin/login',
  '/merchant/login',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is protected
  const isPathProtected = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if current path is an auth path (login pages)
  const isAuthPath = authPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Get auth tokens from cookies
  const { accessToken, refreshToken } = getServerSideTokens();
  const isAuthenticated = !!accessToken && !!refreshToken;
  
  // If the path is protected and the user is not authenticated, redirect to login
  if (isPathProtected && !isAuthenticated) {
    const returnUrl = request.nextUrl.pathname + request.nextUrl.search;
    const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/merchant/login';
    
    // Create url to redirect to
    const redirectUrl = new URL(`${loginPath}?returnUrl=${encodeURIComponent(returnUrl)}`, request.url);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // If the user is authenticated and trying to access a login page, redirect to dashboard
  if (isAuthPath && isAuthenticated) {
    const dashboardPath = pathname.startsWith('/admin') ? '/admin/dashboard' : '/merchant/dashboard';
    const redirectUrl = new URL(dashboardPath, request.url);
    
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Protected paths
    '/admin/dashboard/:path*',
    '/merchant/dashboard/:path*',
    // Auth paths
    '/admin/login',
    '/merchant/login',
  ],
};
