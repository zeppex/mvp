/**
 * Server-side token refresh handler
 * This is for use in API routes and server components in Next.js
 */

import { cookies } from 'next/headers';
import axios from 'axios';
import { User } from '@/types/user';

// Server-side API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * Get tokens from cookies on the server-side
 */
export function getServerSideTokens() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  
  return { accessToken, refreshToken };
}

/**
 * Get current user from cookies on server-side
 */
export async function getServerSideUser() {
  const { accessToken, refreshToken } = getServerSideTokens();
  
  if (!accessToken || !refreshToken) {
    return null;
  }
  
  // TODO: Implement user verification with the backend if needed
  // For now, we'll return null as the user data needs to be set client-side
  return null;
}

/**
 * Perform server-side token refresh
 * Used in API routes to refresh tokens
 */
export async function serverSideRefreshToken(refreshToken: string) {
  try {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('Server-side token refresh failed:', error);
    return null;
  }
}

/**
 * Set auth cookies in the response
 * Used in API routes to set cookies in the response
 */
export function setServerSideAuthCookies(
  response: any, 
  { accessToken, refreshToken }: { accessToken: string; refreshToken: string }
) {
  // Set access token cookie
  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    path: '/',
    maxAge: 15 * 60, // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  
  // Set refresh token cookie with httpOnly
  response.cookies.set({
    name: 'refreshToken',
    value: refreshToken,
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  });
  
  // Set token expiry time
  response.cookies.set({
    name: 'tokenExpiry',
    value: String(Date.now() + (15 * 60 * 1000)), // 15 minutes
    path: '/',
    maxAge: 15 * 60,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}
