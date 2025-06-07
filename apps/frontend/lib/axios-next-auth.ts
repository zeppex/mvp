// HTTP interceptor using NextAuth for authentication
import axios, { AxiosError } from "axios";
import { signOut } from "next-auth/react";
import { getSession } from "next-auth/react";

// Create axios instance
const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending/receiving cookies in CORS requests
});

// Request interceptor to add auth token from Next Auth
apiClient.interceptors.request.use(
  async (config) => {
    // Only run on client side
    if (typeof window !== "undefined") {
      try {
        // Get the session directly from NextAuth
        const session = await getSession();

        // Add the access token to the request if available
        if (session?.accessToken) {
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

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // On authentication error, sign out and redirect to login
      // NextAuth will handle token refreshes automatically
      if (typeof window !== "undefined") {
        // Get current URL to determine the redirect path
        const path = window.location.pathname;
        const loginPage = path.startsWith("/admin")
          ? "/admin/login"
          : path.startsWith("/merchant")
          ? "/merchant/login"
          : "/admin/login";

        await signOut({ callbackUrl: loginPage });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
