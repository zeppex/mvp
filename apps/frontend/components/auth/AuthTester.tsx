"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { isTokenExpiringSoon, refreshToken } from '@/lib/auth';
import api from '@/lib/axios';

export default function AuthTester() {
  const { user, authenticated, logout } = useAuth();
  const [status, setStatus] = useState("");
  const [tokenData, setTokenData] = useState<{expires?: string, accessToken?: string}>({});
  
  // Check token status
  useEffect(() => {
    if (authenticated) {
      const expiringSoon = isTokenExpiringSoon();
      const expiryTime = document.cookie
        .split('; ')
        .find(row => row.startsWith('tokenExpiry='))
        ?.split('=')[1];
      
      if (expiryTime) {
        const expires = new Date(Number(expiryTime)).toLocaleTimeString();
        setTokenData({ expires });
      }
      
      setStatus(expiringSoon ? "Token expiring soon" : "Token valid");
    } else {
      setStatus("Not authenticated");
    }
  }, [authenticated]);

  // Function to test an authenticated API call
  const testApiCall = async () => {
    try {
      setStatus("Making API call...");
      const response = await api.get('/user/profile');
      setStatus(`API call successful: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('API call error', error);
      setStatus(`API call failed: ${error.message}`);
    }
  };

  // Function to manually refresh tokens
  const handleRefreshToken = async () => {
    try {
      setStatus("Refreshing token...");
      const response = await refreshToken();
      
      if (response && response.success) {
        const expiryTime = document.cookie
          .split('; ')
          .find(row => row.startsWith('tokenExpiry='))
          ?.split('=')[1];
        
        if (expiryTime) {
          const expires = new Date(Number(expiryTime)).toLocaleTimeString();
          setTokenData({ expires });
        }
        
        setStatus("Token refreshed successfully");
      } else {
        setStatus("Token refresh failed");
      }
    } catch (error) {
      console.error('Token refresh error', error);
      setStatus(`Token refresh failed: ${error.message}`);
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
