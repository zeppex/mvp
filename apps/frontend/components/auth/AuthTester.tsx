"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from '@/lib/axios';
import { useSession } from "next-auth/react";

export default function AuthTester() {
  const { user, authenticated, logout } = useCurrentUser();
  const { data: session, update: updateSession } = useSession();
  const [status, setStatus] = useState("");
  const [tokenData, setTokenData] = useState<{
    expires?: string;
    accessToken?: string;
  }>({});

  // Check token status
  useEffect(() => {
    if (authenticated) {
      // With Next Auth, token handling is automatic
      // We can still check the session expiry if needed
      if (session?.expires) {
        const expires = new Date(session.expires).toLocaleTimeString();
        setTokenData({ expires });

        // Check if token will expire in the next 5 minutes
        const expiresDate = new Date(session.expires);
        const now = new Date();
        const diffMinutes = Math.floor(
          (expiresDate.getTime() - now.getTime()) / (1000 * 60)
        );

        setStatus(diffMinutes < 5 ? "Token expiring soon" : "Token valid");
      }
    } else {
      setStatus("Not authenticated");
    }
  }, [authenticated, session]);

  // Function to test an authenticated API call
  const testApiCall = async () => {
    try {
      setStatus("Making API call...");
      const response = await api.get("/user/profile");
      setStatus(`API call successful: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error("API call error", error);
      setStatus(`API call failed: ${error?.message || "Unknown error"}`);
    }
  };

  // Function to manually refresh the session
  const handleRefreshToken = async () => {
    try {
      setStatus("Refreshing session...");
      await updateSession();

      if (session?.expires) {
        const expires = new Date(session.expires).toLocaleTimeString();
        setTokenData({ expires });
        setStatus("Session refreshed successfully");
      } else {
        setStatus("Session refresh failed");
      }
    } catch (error: any) {
      console.error("Session refresh error", error);
      setStatus(`Session refresh failed: ${error?.message || "Unknown error"}`);
    }
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Authentication Tester</CardTitle>
        <CardDescription>Test token refresh and API calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Status</h3>
            <p className="text-sm">{status}</p>
          </div>
          
          {authenticated && (
            <div>
              <h3 className="font-semibold">User</h3>
              <p className="text-sm">{user?.email} ({user?.role})</p>
            </div>
          )}
          
          {tokenData.expires && (
            <div>
              <h3 className="font-semibold">Token Expires</h3>
              <p className="text-sm">{tokenData.expires}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={testApiCall}>Test API Call</Button>
        <Button onClick={handleRefreshToken}>Refresh Token</Button>
      </CardFooter>
    </Card>
  );
}
