# Authentication System Implementation

This document explains the authentication implementation for the Zeppex MVP.

## Overview

The authentication system uses JWT tokens with a secure refresh token mechanism. The system includes:

1. Token-based authentication with automatic token refresh
2. Role-based access control
3. Secure cookie storage with HttpOnly flags
4. Server-side route protection via middleware
5. Client-side authenticated components

## Architecture

### Backend Authentication

- **JWT Strategy**: Access tokens (15 min) and refresh tokens (7 days)
- **Endpoints**:
  - `/auth/login`: Authenticates user credentials
  - `/auth/refresh`: Refreshes access tokens using refresh tokens
- **Protection**: Guards protect routes requiring authentication

### Frontend Authentication

#### Token Storage

Tokens are stored using:
1. **Cookies**:
   - `accessToken`: Regular cookie (15 min)
   - `refreshToken`: HttpOnly cookie (7 days) for security
   - `tokenExpiry`: Token expiration timestamp

2. **User Data**:
   - LocalStorage: Stores user data for app use

#### Authentication Flow

1. **Login**:
   - User submits credentials
   - Backend validates and returns tokens + user data
   - Frontend stores tokens in cookies and user data in localStorage

2. **Token Refresh**:
   - Automatic refresh when token is expiring soon
   - Background refresh via axios interceptors
   - API route handles secure refresh with HttpOnly cookies

3. **Protected Routes**:
   - Client-side: `AuthGuard` component and `useAuth` hook
   - Server-side: Next.js middleware for route protection

4. **Logout**:
   - Clear all cookies and localStorage data
   - Redirect to login page

## Key Components

### Frontend

#### Hooks and Utils
- `useAuth`: Hook for authentication state
- `auth.ts`: Authentication service
- `cookies.ts`: Cookie management
- `axios.ts`: API client with token interceptors

#### Components
- `AuthGuard`: Protects routes by role
- `TokenRefreshListener`: Listens for refresh events
- `withAuth`: HOC for protected components

#### API Routes
- `/api/auth/login`: Secure login with HttpOnly cookies
- `/api/auth/refresh`: Token refresh with HttpOnly cookies
- `/api/auth/logout`: Secure logout clearing cookies

### Backend

- `auth.controller.ts`: Authentication endpoints
- `auth.service.ts`: Token generation and validation
- `jwt.strategy.ts`: JWT validation strategy
- Guards for route protection

## Security Features

1. **HttpOnly Cookies**: Prevents JavaScript access to refresh tokens
2. **Short-lived Access Tokens**: 15-minute expiry
3. **Automatic Token Refresh**: Background refresh before expiry
4. **CORS with Credentials**: Secure cross-origin requests
5. **Server-side Validation**: Middleware for route protection

## Testing

Use the `AuthTester` component to:
- Monitor token expiry
- Test manual token refresh
- Make authenticated API calls
- Verify authentication state

## Common Issues

1. **Token Refresh Loops**: Check for cyclic refresh calls in interceptors
2. **CORS Issues**: Ensure correct CORS configuration with credentials
3. **Cookie Access**: HttpOnly cookies can't be accessed by JavaScript
