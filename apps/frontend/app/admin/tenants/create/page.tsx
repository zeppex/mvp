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

export default function TenantCreateRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to merchant creation page as tenants are now managed as merchants
    router.replace("/admin/merchants/create");
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Redirecting...</CardTitle>
          <CardDescription>
            Tenant creation has been migrated to merchant creation. Redirecting
            you to the merchant creation page...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            If you are not redirected automatically, please visit{" "}
            <a
              href="/admin/merchants/create"
              className="text-blue-600 underline"
            >
              /admin/merchants/create
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
