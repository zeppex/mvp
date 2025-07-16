"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  MoreHorizontal,
  Plus,
  Search,
  UserX,
  Loader2,
} from "lucide-react";

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
  branches?: any[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "superadmin" | "admin" | "branch_admin" | "cashier";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  merchant?: Merchant;
  branch?: any;
  pos?: any;
}

export default function MerchantUsersPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const [searchQuery, setSearchQuery] = useState("");
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch merchant data
        const merchantResponse = await fetch(`/api/merchants/${merchantId}`);
        if (!merchantResponse.ok) {
          throw new Error("Failed to fetch merchant");
        }
        const merchantData = await merchantResponse.json();
        setMerchant(merchantData);

        // Fetch users for this merchant
        const usersResponse = await fetch(
          `/api/users?merchantId=${merchantId}`
        );
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        setUsers(usersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (merchantId) {
      fetchData();
    }
  }, [merchantId]);

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "superadmin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "branch_admin":
        return "Branch Admin";
      case "cashier":
        return "Cashier";
      default:
        return role;
    }
  };

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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold">Merchant not found</h2>
        <p className="text-muted-foreground">
          {error || "The requested merchant could not be found."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard/merchants">Return to Merchants</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/dashboard/merchants">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Users</h2>
          <p className="text-muted-foreground">
            Add, view, and manage users for {merchant.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>
                A list of all users associated with this merchant.
              </CardDescription>
            </div>
            <Button asChild>
              <Link
                href={`/admin/dashboard/merchants/${merchant.id}/users/new`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New User
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {users.length === 0
                        ? "No users found for this merchant"
                        : "No users match your search"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-500" />
                          )}
                          <span className="capitalize">
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Edit User</DropdownMenuItem>
                            <DropdownMenuItem>Reset Password</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              {user.isActive
                                ? "Deactivate User"
                                : "Activate User"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
