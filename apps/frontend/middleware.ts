import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Use the same JWT secret as the backend
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "your-super-secret-jwt-key-minimum-32-characters-long-change-this-in-production"
);

interface UserPayload {
  sub: string;
  role: "superadmin" | "admin" | "branch_admin" | "cashier";
  email: string;
}

async function verifySession(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify<UserPayload>(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get("session")?.value;

  console.log("Middleware - Path:", path);
  console.log("Middleware - Session cookie exists:", !!sessionCookie);

  const isPublicRoute =
    path === "/" ||
    path.startsWith("/payment-order") ||
    path.startsWith("/payment");
  const isAuthRoute = path === "/admin/login" || path === "/merchant/login";

  if (isAuthRoute) {
    if (sessionCookie) {
      console.log("Middleware - Auth route with session, verifying...");
      const session = await verifySession(sessionCookie);
      console.log("Middleware - Session verification result:", session);
      if (session?.sub) {
        // Only superadmin should go to admin dashboard
        // admin, branch_admin, and cashier should go to merchant dashboard
        const isSuperAdmin = session.role === "superadmin";
        const dashboardUrl = isSuperAdmin
          ? "/admin/dashboard"
          : "/merchant/dashboard";
        console.log("Middleware - Redirecting to:", dashboardUrl);
        return NextResponse.redirect(new URL(dashboardUrl, request.url));
      }
    }
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const loginUrl = path.startsWith("/admin")
      ? "/admin/login"
      : "/merchant/login";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const session = await verifySession(sessionCookie);

  if (!session?.sub) {
    const loginUrl = path.startsWith("/admin")
      ? "/admin/login"
      : "/merchant/login";
    const response = NextResponse.redirect(new URL(loginUrl, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: "/" });
    return response;
  }

  const isProtectedAdmin = path.startsWith("/admin/dashboard");
  const isProtectedMerchant = path.startsWith("/merchant/dashboard");

  if (
    isProtectedAdmin &&
    session.role !== "superadmin"
  ) {
    return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
  }

  if (
    isProtectedMerchant &&
    session.role !== "admin" &&
    session.role !== "branch_admin" &&
    session.role !== "cashier"
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|crypto-qr-code-scan.png).*)",
  ],
};
