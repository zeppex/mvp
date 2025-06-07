// HTTP interceptor to handle auth errors
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getToken } from "next-auth/jwt";

// NextAuth will handle token refreshing automatically
// This file is now simplified to work with Next Auth

// Create axios instance
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending/receiving cookies in CORS requests
});

// Request interceptor to add auth token from Next Auth
// Server-side usage will get token from the session directly
apiClient.interceptors.request.use(
  async (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        // Get the token from the session cookie (handled by Next Auth)
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
      return config;
    }
    
    // If token is completely expired, try to refresh before proceeding
    if (isTokenExpired() && !isRefreshing) {
      try {
        await refreshAccessToken();
      } catch (error) {
        // Token refresh failed, allow request to proceed
        // The response interceptor will handle the 401
        console.error('Token refresh failed in request interceptor:', error);
      }
    }
    // For normal token expiry (approaching but not expired), we'll handle in the background
    else if (isTokenExpiringSoon() && !isRefreshing) {
      // Don't await, let this happen in background
      refreshAccessToken().catch(error => 
        console.error('Background token refresh failed:', error)
      );
    }
    
    // Add the current access token to request
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

    // If 401 error and not already retrying and not a refresh token request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry && 
      originalRequest.url !== '/auth/refresh'
    ) {
      // Mark as retrying to prevent infinite loops
      originalRequest._retry = true;

      // If another request is already refreshing, wait for the token
      if (isRefreshing) {
        try {
          // Wait for the new token
          const newToken = await new Promise<string | null>((resolve, reject) => {
            addSubscriber((token) => {
              if (token !== undefined) {
                resolve(token);
              } else {
                reject(new Error('Failed to refresh token'));
              }
            });
          });

          // Set new token for this request if we got one
          if (newToken) {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`
            };
            
            // Retry the original request with the new token
            return axios(originalRequest);
          } else {
            throw new Error('No token received from refresh');
          }
        } catch (refreshError) {
          // If still failing after refresh attempt, logout
          logout();
          // Redirect based on the current page
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      // First request to encounter expired token - attempt to refresh
      try {
        isRefreshing = true;
        
        // Try to get a new token
        const refreshResponse = await refreshToken();
        
        if (refreshResponse && refreshResponse.accessToken) {
          // Successfully refreshed the token
          const newAccessToken = refreshResponse.accessToken;
          
          // Update Authorization header for the original request
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`
          };
          
          // Notify all subscribers about the new token
          onRefreshed(newAccessToken);
          
          isRefreshing = false;
          
          // Retry the original request
          return axios(originalRequest);
        } else {
          // If refresh token request fails, logout
          isRefreshing = false;
          logout();
          redirectToLogin();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // If refresh token request fails, logout
        isRefreshing = false;
        logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to refresh access token
 */
async function refreshAccessToken() {
  if (isRefreshing) return;
  
  try {
    isRefreshing = true;
    const response = await refreshToken();
    
    if (response && response.accessToken) {
      // Notify all subscribers about new token
      onRefreshed(response.accessToken);
      
      // Show UI notification if on client side
      if (typeof window !== 'undefined') {
        // We'll use event system to notify about token refresh
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: { success: true }
        }));
      }
      
      return response.accessToken;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Notify UI about failed refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed', {
        detail: { error }
      }));
    }
    
    // If refresh fails, logout and redirect
    logout();
    redirectToLogin();
    onRefreshed(null); // Notify subscribers about failed refresh
    throw error;
  } finally {
    isRefreshing = false;
  }
}

/**
 * Helper function to redirect to appropriate login page
 */
function redirectToLogin() {
  if (typeof window === 'undefined') return;
  
  // Check the current URL to determine which login page to redirect to
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    window.location.href = '/admin/login';
  } else if (path.startsWith('/merchant')) {
    window.location.href = '/merchant/login';
  } else {
    // Default to admin login if can't determine
    window.location.href = '/admin/login';
  }
}

export default apiClient;
