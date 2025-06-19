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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Plus,
  Search,
  MoreHorizontal,
  Settings,
  Trash2,
  Eye,
  Users,
} from "lucide-react";
import merchantApi, { Merchant } from "@/lib/merchant-api";
import userApi, { User } from "@/lib/user-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface MerchantUsersPageProps {
  params: { id: string };
}

function MerchantUsersPageContent({ params }: MerchantUsersPageProps) {
  const merchantId = params.id;
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchMerchantAndUsers();
    }
  }, [merchantId]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery]);

  const fetchMerchantAndUsers = async () => {
    try {
      setLoading(true);
      const [merchantData, usersData] = await Promise.all([
        merchantApi.getMerchant(merchantId),
        userApi.getUsersByMerchant(merchantId),
      ]);
      setMerchant(merchantData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      setError("Failed to load merchant data. Please try again.");
      console.error("Error fetching merchant and users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    router.push(`/admin/merchants/${merchantId}/users/create`);
  };

  const handleEditUser = (userId: string) => {
    router.push(`/admin/merchants/${merchantId}/users/edit/${userId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err) {
        setError("Failed to delete user. Please try again.");
        console.error("Error deleting user:", err);
      }
    }
  };

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return "Platform Admin";
      case UserRole.ADMIN:
        return "Merchant Admin";
      case UserRole.BRANCH_ADMIN:
        return "Branch Admin";
      case UserRole.CASHIER:
        return "Cashier";
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return "destructive";
      case UserRole.ADMIN:
        return "default";
      case UserRole.BRANCH_ADMIN:
        return "secondary";
      case UserRole.CASHIER:
        return "outline";
      default:
        return "outline";
    }
  };

  const canManageUsers = () => {
    return (
      currentUser?.role === UserRole.SUPERADMIN ||
      (currentUser?.role === UserRole.ADMIN &&
        currentUser.merchantId === merchantId)
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/merchants")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Merchants
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {merchant ? `${merchant.name} - Users` : "Merchant Users"}
            </h1>
            <p className="text-muted-foreground">
              Manage users for this merchant
            </p>
          </div>
        </div>
        {canManageUsers() && (
          <Button
            onClick={handleCreateUser}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users
          </CardTitle>
          <CardDescription>
            {merchant && `All users associated with ${merchant.name}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-2">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : "Get started by adding your first user."}
              </p>
              {canManageUsers() && !searchQuery && (
                <Button onClick={handleCreateUser} className="mt-4">
                  Add First User
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableCaption>
                Showing {filteredUsers.length} of {users.length} users
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.branch ? user.branch.name : "All Branches"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleViewUser(user.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canManageUsers() && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user.id)}
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
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

// Create a protected version of the component
const MerchantUsersPage = withNextAuth(MerchantUsersPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN],
  loginUrl: "/admin/login",
});

export default MerchantUsersPage;
