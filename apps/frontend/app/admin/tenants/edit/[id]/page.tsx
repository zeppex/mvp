"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TenantEditRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to merchants page as tenants are now managed as merchants
    // Note: Tenant IDs may not directly map to merchant IDs
    router.replace("/admin/merchants");
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>
            Tenant editing has been migrated to merchant management. Redirecting
            you to the merchants page...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Tenant ID: {params.id}
            <br />
            If you are not redirected automatically, please visit{" "}
            <a href="/admin/merchants" className="text-blue-600 underline">
              /admin/merchants
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
