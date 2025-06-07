import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { serverSideRefreshToken } from '@/lib/server-auth';

/**
 * API Route for token refresh
 * This provides a more secure way to handle token refresh with HttpOnly cookies
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Refresh token not found' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call backend to refresh the token
    const response = await serverSideRefreshToken(refreshToken);
    
    if (!response || !response.accessToken || !response.refreshToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Failed to refresh token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create response with new tokens
    const result = NextResponse.json({
      user: response.user,
      success: true
    });
    
    // Set cookies in response
    result.cookies.set({
      name: 'accessToken',
      value: response.accessToken,
      path: '/',
      maxAge: 15 * 60, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    result.cookies.set({
      name: 'refreshToken',
      value: response.refreshToken,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      httpOnly: true, // Can't be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Set token expiry time
    result.cookies.set({
      name: 'tokenExpiry',
      value: String(Date.now() + (15 * 60 * 1000)), // 15 minutes
      path: '/',
      maxAge: 15 * 60,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    return result;
  } catch (error) {
    console.error('API token refresh error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
