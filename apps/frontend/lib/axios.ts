// HTTP interceptor to handle auth with NextAuth
import axios, { AxiosError, AxiosRequestConfig } from "axios";

// Create axios instance
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending/receiving cookies in CORS requests
});

// Request interceptor to add auth token from NextAuth
apiClient.interceptors.request.use(
  async (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        // Get the token from the session cookie (handled by NextAuth)
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session && session.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Safety check for config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // If 401 error and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // For NextAuth, we redirect to sign-in page on 401
      if (typeof window !== 'undefined') {
        // Check the current URL to determine which login page to redirect to
        const path = window.location.pathname;
        
        if (path.startsWith('/admin')) {
          window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href);
        } else if (path.startsWith('/merchant')) {
          window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href);
        } else {
          window.location.href = '/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
