"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginTester() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<string>("");

  // Function to test sign in with redirect
  const handleSignIn = async () => {
    setMessage("Signing in...");
    await signIn("credentials", {
      // Set callbackUrl to /admin/dashboard
      callbackUrl: "/admin/dashboard",
      email: "admin@zeppex.io", // Replace with a test email
      password: "admin123", // Replace with a test password
    });
  };

  // Function to test sign in without redirect
  const handleSignInNoRedirect = async () => {
    setMessage("Signing in without redirect...");
    const result = await signIn("credentials", {
      redirect: false,
      email: "admin@zeppex.io", // Replace with a test email
      password: "admin123", // Replace with a test password
    });

    if (result?.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage("Sign in successful! Redirecting in 2 seconds...");
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    }
  };

  // Function to sign out
  const handleSignOut = async () => {
    setMessage("Signing out...");
    await signOut({ callbackUrl: "/" });
  };

  // Function to manually navigate
  const handleManualNavigation = () => {
    setMessage("Navigating to dashboard...");
    router.push("/admin/dashboard");
  };

  // Check session status on component mount
  useEffect(() => {
    if (status === "authenticated") {
      setMessage(`Authenticated as ${session.user?.email}`);
    } else if (status === "loading") {
      setMessage("Loading session...");
    } else {
      setMessage("Not authenticated");
    }
  }, [session, status]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test Tool</CardTitle>
          <CardDescription>
            Test login redirects and authentication flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2">Status</h3>
            <p className="text-sm">{message}</p>

            {session && (
              <div className="mt-2">
                <h4 className="font-medium">Session Data</h4>
                <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-40">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button onClick={handleSignIn} disabled={status === "authenticated"}>
            Sign In (With Redirect)
          </Button>
          <Button
            onClick={handleSignInNoRedirect}
            disabled={status === "authenticated"}
            variant="outline"
          >
            Sign In (No Redirect)
          </Button>
          <Button onClick={handleManualNavigation} variant="secondary">
            Manual Navigation
          </Button>
          <Button
            onClick={handleSignOut}
            disabled={status !== "authenticated"}
            variant="destructive"
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
