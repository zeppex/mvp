"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle2, MoreHorizontal, Plus, Search, UserX } from "lucide-react"

// Mock merchant data (find by ID)
const merchants = [
  {
    id: "M001",
    name: "Starbucks",
    branch: "Unicenter 2",
  },
  {
    id: "M002",
    name: "Howtradethat",
    branch: "Main Branch",
  },
]

// Mock user data for a merchant
const users = [
  {
    id: "U001",
    name: "John Doe",
    email: "john_doe@starbucks.com",
    role: "Manager",
    status: "active",
    createdAt: "2025-01-15T10:05:00",
    merchantId: "M001",
  },
  {
    id: "U002",
    name: "Jane Smith",
    email: "jane_smith@starbucks.com",
    role: "Cashier",
    status: "active",
    createdAt: "2025-01-16T11:30:00",
    merchantId: "M001",
  },
  {
    id: "U003",
    name: "Peter Jones",
    email: "peter_jones@starbucks.com",
    role: "Cashier",
    status: "inactive",
    createdAt: "2025-02-01T09:00:00",
    merchantId: "M001",
  },
]

export default function MerchantUsersPage({ params }: { params: { merchantId: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const merchant = merchants.find((m) => m.id === params.merchantId)
  const merchantUsers = users.filter((u) => u.merchantId === params.merchantId)

  const filteredUsers = merchantUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-2xl font-bold">Merchant not found</h2>
        <p className="text-muted-foreground">The requested merchant could not be found.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/dashboard/merchants">Return to Merchants</Link>
        </Button>
      </div>
    )
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
            Add, view, and manage users for {merchant.name} - {merchant.branch}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>User List</CardTitle>
              <CardDescription>A list of all users associated with this merchant.</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/admin/dashboard/merchants/${merchant.id}/users/new`}>
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
                      No users found for this merchant
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.status === "active" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <UserX className="h-4 w-4 text-red-500" />
                          )}
                          <span className="capitalize">{user.status}</span>
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
                            <DropdownMenuItem className="text-red-600">Deactivate User</DropdownMenuItem>
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
  )
}
