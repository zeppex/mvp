"use client";

import { useState, useEffect } from "react";
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
import userApi, { User } from "@/lib/user-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";

interface TenantUsersPageProps {
  params: { id: string };
}

function TenantUsersPage({ params }: TenantUsersPageProps) {
  const tenantId = params.id;
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTenantAndUsers = async () => {
      try {
        setLoading(true);
        const [tenantData, usersData] = await Promise.all([
          tenantApi.getTenant(tenantId),
          userApi.getUsersByTenant(tenantId),
        ]);
        setTenant(tenantData);
        setUsers(usersData);
        setError(null);
      } catch (err) {
        setError("Failed to load tenant data. Please try again.");
        console.error("Error fetching tenant data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantAndUsers();
  }, [tenantId]);

  const handleCreateUser = () => {
    router.push(`/admin/tenants/${tenantId}/users/create`);
  };

  const handleEditUser = (id: string) => {
    router.push(`/admin/tenants/${tenantId}/users/edit/${id}`);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.deleteUser(id);
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        setError("Failed to delete user. Please try again.");
        console.error("Error deleting user:", err);
      }
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.TENANT_ADMIN:
        return "default";
      case UserRole.MERCHANT_ADMIN:
        return "secondary";
      case UserRole.BRANCH_ADMIN:
        return "outline";
      case UserRole.POS_USER:
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenant Users</h1>
          {tenant && (
            <p className="text-gray-500">
              {tenant.displayName} ({tenant.name})
            </p>
          )}
        </div>
        <div className="space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/tenants")}
          >
            Back to Tenants
          </Button>
          <Button onClick={handleCreateUser}>Add User</Button>
        </div>
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
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage users for this tenant</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4">
              No users found for this tenant
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all users in this tenant</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "outline" : "destructive"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
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

const ProtectedTenantUsersPage = withNextAuth(TenantUsersPage, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default ProtectedTenantUsersPage;
