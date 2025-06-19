import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { User } from "@/types/user";
import axios from "axios";

// Server-side API URL
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Call backend to login
          const response = await axios.post<LoginResponse>(
            `${API_URL}/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          if (
            !response.data ||
            !response.data.accessToken ||
            !response.data.refreshToken
          ) {
            return null;
          }

          // Return user data with tokens
          return {
            id: response.data.user.id,
            email: response.data.user.email,
            name: `${response.data.user.firstName} ${response.data.user.lastName}`,
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            role: response.data.user.role,
            merchantId: response.data.user.merchantId,
            branchId: response.data.user.branchId,
            posId: response.data.user.posId,
            isActive: response.data.user.isActive,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Handles the default case where a relative URL is provided (i.e., /admin/dashboard)
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Default redirect to dashboard
      return `${baseUrl}/admin/dashboard`;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        // Define expected properties for the token
        token.id = user.id as string;
        token.email = user.email as string;
        token.firstName = user.firstName as string;
        token.lastName = user.lastName as string;
        token.role = user.role as string;
        token.merchantId = user.merchantId as string | undefined;
        token.branchId = user.branchId as string | undefined;
        token.posId = user.posId as string | undefined;
        token.isActive = user.isActive as boolean;
        token.accessToken = user.accessToken as string;
        token.refreshToken = user.refreshToken as string;
      }

      // Check if access token is expiring soon (within 1 minute)
      const expiryTime = token.exp ? (token.exp as number) * 1000 : 0; // Convert to ms
      const isExpiringSoon = expiryTime > 0 && expiryTime - Date.now() < 60000;

      // If token is expiring soon and we have a refresh token, try to refresh it
      if (isExpiringSoon && token.refreshToken) {
        try {
          const response = await axios.post<LoginResponse>(
            `${API_URL}/auth/refresh`,
            { refreshToken: token.refreshToken }
          );

          if (response.data && response.data.accessToken) {
            // Update token with new values
            token.accessToken = response.data.accessToken;
            token.refreshToken = response.data.refreshToken;

            // If the user data was also returned, update that too
            if (response.data.user) {
              token.id = response.data.user.id;
              token.email = response.data.user.email;
              token.firstName = response.data.user.firstName;
              token.lastName = response.data.user.lastName;
              token.role = response.data.user.role;
              token.merchantId = response.data.user.merchantId;
              token.branchId = response.data.user.branchId;
              token.posId = response.data.user.posId;
              token.isActive = response.data.user.isActive;
            }
          }
        } catch (error) {
          console.error("Token refresh error:", error);
          // If refresh fails, just return the current token
          // The next request will fail if the token is truly expired
        }
      }

      return token;
    },

    async session({ session, token }) {
      // Send properties to the client
      session.user = {
        ...session.user,
        id: token.id as string,
        email: token.email as string,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        role: token.role as string,
        merchantId: token.merchantId as string | undefined,
        branchId: token.branchId as string | undefined,
        posId: token.posId as string | undefined,
        isActive: token.isActive as boolean,
      };

      session.accessToken = token.accessToken as string;
      session.refreshToken = token.refreshToken as string;

      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
    signOut: "/",
    // Default URL after login if no callback is provided
    newUser: "/admin/dashboard",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};
