"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AuthDebug() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("admin@zeppex.io");
  const [password, setPassword] = useState("admin123");
  const [callbackUrl, setCallbackUrl] = useState("/admin/dashboard");
  const [loginMethod, setLoginMethod] = useState<"redirect" | "no-redirect">(
    "no-redirect"
  );
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Get the current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const debugError = urlParams.get("error");
    if (debugError) {
      setDebugInfo((prev) => ({ ...prev, urlError: debugError }));
    }

    // Update debug info whenever session/status changes
    setDebugInfo((prev) => ({
      ...prev,
      status,
      session: session
        ? {
            expires: session.expires,
            user: session.user,
          }
        : null,
      timestamp: new Date().toISOString(),
    }));
  }, [session, status]);

  const handleLogin = async () => {
    setDebugInfo((prev) => ({
      ...prev,
      loginAttempt: {
        timestamp: new Date().toISOString(),
        email,
        callbackUrl,
        redirect: loginMethod === "redirect",
      },
    }));

    try {
      if (loginMethod === "redirect") {
        // Login with redirect
        await signIn("credentials", {
          redirect: true,
          email,
          password,
          callbackUrl,
        });
      } else {
        // Login without redirect
        const result = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        setDebugInfo((prev) => ({
          ...prev,
          loginResult: {
            timestamp: new Date().toISOString(),
            ...result,
          },
        }));

        if (!result?.error) {
          // Manual redirect after successful login
          window.location.href = callbackUrl;
        }
      }
    } catch (error) {
      setDebugInfo((prev) => ({
        ...prev,
        loginError: {
          timestamp: new Date().toISOString(),
          message: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setDebugInfo((prev) => ({
      ...prev,
      logoutAttempt: {
        timestamp: new Date().toISOString(),
      },
    }));
  };

  const handleRefreshSession = async () => {
    const response = await fetch("/api/auth/session");
    const sessionData = await response.json();

    setDebugInfo((prev) => ({
      ...prev,
      manualSessionCheck: {
        timestamp: new Date().toISOString(),
        data: sessionData,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Authentication Debugger</CardTitle>
          <CardDescription>
            Status: <span className="font-bold">{status}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callbackUrl">Callback URL</Label>
            <Input
              id="callbackUrl"
              value={callbackUrl}
              onChange={(e) => setCallbackUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginMethod">Login Method</Label>
            <select
              id="loginMethod"
              value={loginMethod}
              onChange={(e) =>
                setLoginMethod(e.target.value as "redirect" | "no-redirect")
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="redirect">With Redirect</option>
              <option value="no-redirect">Without Redirect (Manual)</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="space-x-2">
            <Button onClick={handleLogin} disabled={status === "loading"}>
              Login
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              disabled={status !== "authenticated"}
            >
              Logout
            </Button>
          </div>
          <Button onClick={handleRefreshSession} variant="secondary">
            Check Session
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs p-4 bg-gray-100 rounded-md overflow-auto max-h-[400px]">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {session && (
        <Card className="w-full overflow-hidden">
          <CardHeader>
            <CardTitle>Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs p-4 bg-gray-100 rounded-md overflow-auto max-h-[400px]">
              {JSON.stringify(session, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
