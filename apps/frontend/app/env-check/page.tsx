"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function EnvChecker() {
  const [envVars, setEnvVars] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEnv() {
      try {
        const response = await fetch("/api/env-check");
        const data = await response.json();
        setEnvVars(data);
      } catch (error) {
        console.error("Failed to fetch environment variables", error);
        setEnvVars({ error: "Failed to fetch environment variables" });
      } finally {
        setLoading(false);
      }
    }

    checkEnv();
  }, []);

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Environment Configuration Checker</CardTitle>
          <CardDescription>
            Checking Next Auth environment configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading environment data...</div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Next Auth Configuration</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-medium">NEXTAUTH_URL</div>
                <div
                  className={
                    envVars.NEXTAUTH_URL ? "text-green-600" : "text-red-600"
                  }
                >
                  {envVars.NEXTAUTH_URL || "Not set"}
                </div>

                <div className="font-medium">NEXTAUTH_SECRET</div>
                <div
                  className={
                    envVars.NEXTAUTH_SECRET ? "text-green-600" : "text-red-600"
                  }
                >
                  {envVars.NEXTAUTH_SECRET ? "Set (hidden)" : "Not set"}
                </div>

                <div className="font-medium">API URL</div>
                <div
                  className={
                    envVars.NEXT_PUBLIC_API_URL
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {envVars.NEXT_PUBLIC_API_URL || "Not set"}
                </div>
              </div>

              <h2 className="text-lg font-semibold mt-6">Status</h2>
              <div
                className={`p-3 rounded-md ${
                  !envVars.NEXTAUTH_SECRET || !envVars.NEXTAUTH_URL
                    ? "bg-red-50 text-red-800"
                    : "bg-green-50 text-green-800"
                }`}
              >
                {!envVars.NEXTAUTH_SECRET || !envVars.NEXTAUTH_URL
                  ? "Missing required environment variables for Next Auth"
                  : "Next Auth configuration looks good!"}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
