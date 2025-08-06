"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Building,
  MapPin,
  Mail,
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Merchant {
  id: string;
  name: string;
  address: string;
  contact: string;
  contactName: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branches?: Array<{
    id: string;
    name: string;
    address: string;
    contactName: string;
    contactPhone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    pos?: Array<{
      id: string;
      name: string;
      description: string;
      isActive: boolean;
    }>;
  }>;
}

export default function MerchantDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const merchantId = params.merchantId as string;
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await fetch(`/api/merchants/${merchantId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch merchant");
        }
        const data = await response.json();
        console.log("Merchant data received:", data);
        setMerchant(data);

        // If this was a refresh request, clean up the URL
        if (searchParams.get("refresh") === "true") {
          router.replace(`/admin/dashboard/merchants/${merchantId}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchMerchant();
    }
  }, [merchantId, searchParams.get("refresh"), router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/merchants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/merchants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Merchant Details
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {error || "Merchant not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard/merchants">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {merchant.name}
            </h2>
            <p className="text-muted-foreground">
              Merchant details and statistics
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link
              href={`/admin/dashboard/merchants/${merchantId}/branches/new`}
            >
              <Building className="mr-2 h-4 w-4" />
              Add Branch
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/admin/dashboard/merchants/${merchantId}/users`}>
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={merchant.isActive ? "default" : "secondary"}>
          {merchant.isActive ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <Clock className="mr-1 h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Merchant ID: {merchant.id}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Branches
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {merchant.branches?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {merchant.branches?.filter((b: any) => b.isActive).length || 0}{" "}
              active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No users yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No volume yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Merchant Information */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Merchant Information</CardTitle>
            <CardDescription>
              Basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Business Name
                </div>
                <p className="text-sm text-muted-foreground">{merchant.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </div>
                <p className="text-sm text-muted-foreground">
                  {merchant.address}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Contact Person
                </div>
                <p className="text-sm text-muted-foreground">
                  {merchant.contactName}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Contact Email
                </div>
                <p className="text-sm text-muted-foreground">
                  {merchant.contact}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Contact Phone
              </div>
              <p className="text-sm text-muted-foreground">
                {merchant.contactPhone}
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Created
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(merchant.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Last Updated
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(merchant.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branches */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>Merchant locations and branches</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {merchant.branches && merchant.branches.length > 0 ? (
              merchant.branches.map((branch: any) => (
                <div
                  key={branch.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/admin/dashboard/merchants/${merchantId}/branches/${branch.id}`)
                  }
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {branch.address}
                    </p>
                  </div>
                  <Badge variant={branch.isActive ? "default" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No branches found
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link
                    href={`/admin/dashboard/merchants/${merchantId}/branches/new`}
                  >
                    Add Branch
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
