// Cookie utility functions for secure token storage

// Cookie options for enhanced security
const defaultOptions = {
  path: '/',
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60, // 30 days for refresh token
};

// Specific cookie options for different token types
const cookieOptions = {
  accessToken: {
    ...defaultOptions,
    maxAge: 15 * 60, // 15 minutes
  },
  refreshToken: {
    ...defaultOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    httpOnly: true, // Cannot be accessed by JavaScript
  },
};

/**
 * Set a cookie with the specified options
 */
export function setCookie(name: string, value: string, options: Record<string, any> = {}) {
  const cookieOptions = {
    ...defaultOptions,
    ...options,
  };

  const cookieString = `${name}=${encodeURIComponent(value)}` + Object.entries(cookieOptions)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      if (value === true) return `; ${key}`;
      return `; ${key}=${value}`;
    })
    .join('');

  if (typeof document !== 'undefined') {
    document.cookie = cookieString;
  }
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const cookies = document.cookie.split('; ');
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!cookie) return undefined;
  
  return decodeURIComponent(cookie.split('=')[1]);
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string, options: Record<string, any> = {}) {
  setCookie(name, '', {
    ...options,
    maxAge: -1, // Expire immediately
  });
}

/**
 * Set auth cookies
 */
export function setAuthCookies(accessToken: string, refreshToken: string) {
  // Access token is stored in a regular cookie (for easy access)
  setCookie('accessToken', accessToken, cookieOptions.accessToken);
  
  // Refresh token is stored in HttpOnly cookie (for security)
  // Note: In a real implementation, HttpOnly cookies must be set by the server
  // This is just a client-side simulation
  setCookie('refreshToken', refreshToken, cookieOptions.refreshToken);
  
  // Store token expiry time
  const expiryTime = Date.now() + (cookieOptions.accessToken.maxAge * 1000);
  setCookie('tokenExpiry', String(expiryTime), cookieOptions.accessToken);
}

/**
 * Clear all auth cookies
 */
export function clearAuthCookies() {
  removeCookie('accessToken');
  removeCookie('refreshToken', { path: '/' });
  removeCookie('tokenExpiry');
}

/**
 * Check if access token is expiring soon (within 1 minute)
 */
export function isTokenExpiringSoon(): boolean {
  const expiryTime = getCookie('tokenExpiry');
  
  if (!expiryTime) return true;
  
  // If token will expire in the next minute, consider it expiring soon
  return Date.now() > (Number(expiryTime) - 60000);
}

/**
 * Check if token is completely expired
 */
export function isTokenExpired(): boolean {
  const expiryTime = getCookie('tokenExpiry');
  
  if (!expiryTime) return true;
  
  return Date.now() > Number(expiryTime);
}

/**
 * Get the access token from cookie
 */
export function getAccessToken(): string | undefined {
  return getCookie('accessToken');
}

/**
 * Get the refresh token from cookie
 */
export function getRefreshToken(): string | undefined {
  return getCookie('refreshToken');
}
