"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Building2,
  Plus,
  MoreHorizontal,
  MapPin,
  Settings,
  Trash2,
  Eye,
  Store,
} from "lucide-react";
import merchantApi, { Branch, Merchant } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";

function BranchesPageContent() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const { data: session } = useSession();

  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [merchantData, branchesData] = await Promise.all([
        merchantApi.getMerchant(merchantId),
        merchantApi.getAllBranches(merchantId),
      ]);
      setMerchant(merchantData);
      setBranches(branchesData);
      setError(null);
    } catch (err) {
      setError("Failed to load branches. Please try again.");
      console.error("Error fetching branches:", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchData();
    }
  }, [fetchData]);

  const handleCreateBranch = () => {
    router.push(`/admin/merchants/${merchantId}/branches/create`);
  };

  const handleEditBranch = (branchId: string) => {
    router.push(`/admin/merchants/${merchantId}/branches/${branchId}/edit`);
  };

  const handleViewBranch = (branchId: string) => {
    router.push(`/admin/merchants/${merchantId}/branches/${branchId}`);
  };

  const handleViewPOS = (branchId: string) => {
    router.push(`/admin/merchants/${merchantId}/branches/${branchId}/pos`);
  };

  const handleDeleteBranch = async (branchId: string) => {
    if (window.confirm("Are you sure you want to delete this branch?")) {
      try {
        await merchantApi.deleteBranch(branchId);
        setBranches(branches.filter((branch) => branch.id !== branchId));
      } catch (err) {
        setError("Failed to delete branch. Please try again.");
        console.error("Error deleting branch:", err);
      }
    }
  };

  // Check permissions
  const userRole = session?.user?.role;
  const canManageBranches =
    userRole === UserRole.SUPERADMIN || userRole === UserRole.ADMIN;

  if (typeof window === "undefined") {
    return (
      <div className="container mx-auto py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200 mb-6" />
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200 mb-6" />
        <Card>
          <CardHeader>
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/merchants")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Merchants
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {merchant?.name} - Branches
          </h1>
          <p className="text-muted-foreground">
            Manage branches for this merchant
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">All Branches</h2>
          <Badge variant="outline">{branches.length} total</Badge>
        </div>
        {canManageBranches && (
          <Button onClick={handleCreateBranch}>
            <Plus className="mr-2 h-4 w-4" />
            Create Branch
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
          <CardDescription>All branches under {merchant?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {branches.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No branches found.</p>
              {canManageBranches && (
                <Button onClick={handleCreateBranch}>
                  Create First Branch
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableCaption>
                A list of all branches for {merchant?.name}.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        {branch.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{branch.contactName}</div>
                        <div className="text-sm text-gray-500">
                          {branch.contactPhone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={branch.isActive ? "default" : "secondary"}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(branch.createdAt))}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewBranch(branch.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewPOS(branch.id)}
                          >
                            <Store className="mr-2 h-4 w-4" />
                            Manage POS
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {canManageBranches && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditBranch(branch.id)}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Edit Branch
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteBranch(branch.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Branch
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default withNextAuth(BranchesPageContent, {
  requiredRoles: [
    UserRole.SUPERADMIN,
    UserRole.ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.CASHIER,
  ],
  loginUrl: "/admin/login",
});
