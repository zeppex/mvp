import { NextResponse } from 'next/server';
import axios from 'axios';
import { User } from '@/types/user';

// Server-side API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * API Route for login
 * This provides a more secure way to handle login with HttpOnly cookies
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call backend to login
    const response = await axios.post<LoginResponse>(
      `${API_URL}/auth/login`,
      { email, password }
    );
    
    if (!response.data || !response.data.accessToken || !response.data.refreshToken) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create response with user data
    const result = NextResponse.json({
      user: response.data.user,
      success: true
    });
    
    // Set cookies in response
    result.cookies.set({
      name: 'accessToken',
      value: response.data.accessToken,
      path: '/',
      maxAge: 15 * 60, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    result.cookies.set({
      name: 'refreshToken',
      value: response.data.refreshToken,
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
    console.error('API login error:', error);
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
