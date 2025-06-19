"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import tenantApi, { Tenant } from "@/lib/tenant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";

function TenantsPageContent() {
  // Start with empty data for SSR
  const [tenants, setTenants] = useState<Tenant[]>([]);
  // Set loading to true on client-side only to prevent hydration mismatch
  const [loading, setLoading] = useState(typeof window !== "undefined");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Only fetch on the client side
    if (typeof window !== "undefined") {
      const fetchTenants = async () => {
        try {
          setLoading(true);
          const data = await tenantApi.getAllTenants();
          setTenants(data);
          setError(null);
        } catch (err) {
          setError("Failed to load tenants. Please try again.");
          console.error("Error fetching tenants:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchTenants();
    }
  }, []);

  const handleCreateTenant = () => {
    router.push("/admin/tenants/create");
  };

  const handleEditTenant = (id: string) => {
    router.push(`/admin/tenants/edit/${id}`);
  };

  const handleViewUsers = (id: string) => {
    router.push(`/admin/tenants/${id}/users`);
  };

  const handleDeleteTenant = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      try {
        await tenantApi.deleteTenant(id);
        setTenants(tenants.filter((tenant) => tenant.id !== id));
      } catch (err) {
        setError("Failed to delete tenant. Please try again.");
        console.error("Error deleting tenant:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tenant Management</h1>
        <Button onClick={handleCreateTenant}>Create Tenant</Button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tenants</CardTitle>
          <CardDescription>Manage all tenants in the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="text-center py-4">No tenants found</div>
          ) : (
            <Table>
              <TableCaption>A list of all tenants</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.displayName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tenant.isActive ? "default" : "destructive"}
                      >
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditTenant(tenant.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewUsers(tenant.id)}
                      >
                        Users
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTenant(tenant.id)}
                      >
                        Delete
                      </Button>
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

// Create a protected version of the component with withNextAuth
const TenantsPage = withNextAuth(TenantsPageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default TenantsPage;
