// Environment variables checker API
import { NextResponse } from "next/server";

export async function GET() {
  // Only expose specific environment variables that we want to check
  // Don't expose sensitive values directly
  return NextResponse.json({
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "set" : null,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || null,
    NODE_ENV: process.env.NODE_ENV || null,
  });
}
