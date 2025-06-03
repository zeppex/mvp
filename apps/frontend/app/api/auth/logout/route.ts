import { NextResponse } from 'next/server';

/**
 * API Route for logout
 * This clears all auth cookies
 */
export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear all auth cookies
    response.cookies.set({
      name: 'accessToken',
      value: '',
      path: '/',
      maxAge: -1, // Expire immediately
    });
    
    response.cookies.set({
      name: 'refreshToken',
      value: '',
      path: '/',
      maxAge: -1, // Expire immediately
      httpOnly: true,
    });
    
    response.cookies.set({
      name: 'tokenExpiry',
      value: '',
      path: '/',
      maxAge: -1, // Expire immediately
    });
    
    return response;
  } catch (error) {
    console.error('API logout error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
