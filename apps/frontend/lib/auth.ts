// Authentication service to interact with the backend
import { User } from "@/types/user";
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  isTokenExpiringSoon,
  isTokenExpired,
  clearAuthCookies, 
} from "./cookies";

interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

interface LoginResponse extends AuthTokens {
  user: User;
  success: boolean;
}

interface RefreshTokenResponse extends AuthTokens {
  user: User;
  success: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

// For backward compatibility - keep user data in localStorage
const USER_STORAGE_KEY = "user";

// Function to handle login
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    // Use our secure API route instead of calling the backend directly
    const { data } = await axios.post<LoginResponse>("/api/auth/login", credentials);
    
    // Store user data in localStorage (cookies are handled by the API route)
    if (data.success && data.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      }
    }

    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// Function to refresh the access token
export async function refreshToken(): Promise<RefreshTokenResponse | null> {
  try {
    // Use our secure API route for token refresh
    const { data } = await axios.post<RefreshTokenResponse>("/api/auth/refresh");
    
    // Update user data in localStorage if available
    if (data.success && data.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      }
    }
    
    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    // If refresh fails, clear auth data
    logout();
    return null;
  }
}

// Function to check if user is logged in
export function isLoggedIn(): boolean {
  // Server-side rendering - fallback to false
  if (typeof window === "undefined") {
    return false;
  }

  // Check if access and refresh tokens exist
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // Ensure tokens are valid and not expired
  return Boolean(accessToken && refreshToken && !isTokenExpired());
}

// Re-export functions from cookies.ts
export { isTokenExpiringSoon, isTokenExpired, getAccessToken, getRefreshToken };

// Function to logout
export async function logout(): Promise<void> {
  try {
    // Call the logout API route
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear cookies
    clearAuthCookies();

    // Clear user data from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }
}

// Function to get the current user
export function getCurrentUser(): User | null {
  // For SSR, we'll return null and handle this with useEffect on the client
  if (typeof window === "undefined") return null;

  // First check if we're logged in
  if (!isLoggedIn()) return null;

  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  console.log("User data from localStorage:", userStr);
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr) as User;
    console.log("Parsed user data:", user);
    return user;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

// Create an axios instance with auth header
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
