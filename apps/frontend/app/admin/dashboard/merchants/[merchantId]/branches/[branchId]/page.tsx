"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Phone,
  User,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Branch {
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
}

export default function BranchDetailPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const branchId = params.branchId as string;
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const response = await fetch(
          `/api/branches/${branchId}?merchantId=${merchantId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch branch");
        }
        const data = await response.json();
        setBranch(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (branchId && merchantId) {
      fetchBranch();
    }
  }, [branchId, merchantId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/dashboard/merchants/${merchantId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Branch Details</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {error || "Branch not found"}
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
            <Link href={`/admin/dashboard/merchants/${merchantId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{branch.name}</h2>
            <p className="text-muted-foreground">
              Branch details and POS terminals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link
              href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}/pos/new`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add POS Terminal
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={branch.isActive ? "default" : "secondary"}>
          {branch.isActive ? (
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
          Branch ID: {branch.id}
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total POS Terminals
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branch.pos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {branch.pos?.filter((p) => p.isActive).length || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No volume yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Branch Information */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Branch Information</CardTitle>
            <CardDescription>
              Basic details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  Branch Name
                </div>
                <p className="text-sm text-muted-foreground">{branch.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </div>
                <p className="text-sm text-muted-foreground">
                  {branch.address}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Contact Person
                </div>
                <p className="text-sm text-muted-foreground">
                  {branch.contactName}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Contact Phone
                </div>
                <p className="text-sm text-muted-foreground">
                  {branch.contactPhone}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Created
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(branch.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Last Updated
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(branch.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POS Terminals */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>POS Terminals</CardTitle>
            <CardDescription>Payment terminals at this branch</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branch.pos && branch.pos.length > 0 ? (
              branch.pos.map((pos) => (
                <Link
                  key={pos.id}
                  href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}/pos/${pos.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{pos.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pos.description}
                    </p>
                  </div>
                  <Badge variant={pos.isActive ? "default" : "secondary"}>
                    {pos.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No POS terminals found
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link
                    href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}/pos/new`}
                  >
                    Add POS Terminal
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
