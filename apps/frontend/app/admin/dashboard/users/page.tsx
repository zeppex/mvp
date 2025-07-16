"use client"

import { useState } from "react"
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
import { CheckCircle2, Filter, MoreHorizontal, Plus, Search, UserX } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddUserModal } from "./add-user-modal"
import Link from "next/link"

// Mock user data from all merchants
const allUsers = [
  {
    id: "U001",
    name: "John Doe",
    email: "john_doe@starbucks.com",
    role: "Manager",
    status: "active",
    createdAt: "2025-01-15T10:05:00",
    merchantId: "M001",
    merchantName: "Starbucks",
    merchantBranch: "Unicenter 2",
  },
  {
    id: "U002",
    name: "Jane Smith",
    email: "jane_smith@starbucks.com",
    role: "Cashier",
    status: "active",
    createdAt: "2025-01-16T11:30:00",
    merchantId: "M001",
    merchantName: "Starbucks",
    merchantBranch: "Unicenter 2",
  },
  {
    id: "U003",
    name: "Peter Jones",
    email: "peter_jones@starbucks.com",
    role: "Cashier",
    status: "inactive",
    createdAt: "2025-02-01T09:00:00",
    merchantId: "M001",
    merchantName: "Starbucks",
    merchantBranch: "Unicenter 2",
  },
  {
    id: "U004",
    name: "Alice Williams",
    email: "alice@howtradethat.com",
    role: "Manager",
    status: "active",
    createdAt: "2025-02-21T10:00:00",
    merchantId: "M002",
    merchantName: "Howtradethat",
    merchantBranch: "Main Branch",
  },
  {
    id: "U005",
    name: "Bob Brown",
    email: "bob@howtradethat.com",
    role: "Cashier",
    status: "active",
    createdAt: "2025-02-22T14:00:00",
    merchantId: "M002",
    merchantName: "Howtradethat",
    merchantBranch: "Main Branch",
  },
]

// Mock merchant list for filtering and for the combobox
const merchants = [
  { id: "M001", name: "Starbucks" },
  { id: "M002", name: "Howtradethat" },
  { id: "M003", name: "Tech Gadgets Inc" },
]

const merchantOptions = merchants.map((merchant) => ({
  value: merchant.id,
  label: merchant.name,
}))

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [merchantFilter, setMerchantFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMerchant = merchantFilter === "all" || user.merchantId === merchantFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter

    return matchesSearch && matchesMerchant && matchesRole && matchesStatus
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <>
      <AddUserModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        merchants={merchantOptions}
        onUserAdded={() => {
          // In a real app with a data fetching library like SWR or React Query,
          // you would invalidate the user query here to refetch the list.
          // For this demo, we'll just log to the console.
          console.log("User added! Refetching list...")
        }}
      />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Administration</h2>
            <p className="text-muted-foreground">Manage all users across the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>A list of all users from all merchants on the platform.</CardDescription>
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
              <div className="flex flex-wrap items-center gap-2">
                <Select value={merchantFilter} onValueChange={setMerchantFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by merchant" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Merchants</SelectItem>
                    {merchants.map((merchant) => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Cashier">Cashier</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.merchantName}</div>
                            <div className="text-sm text-muted-foreground">{user.merchantBranch}</div>
                          </div>
                        </TableCell>
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
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/dashboard/merchants/${user.merchantId}/users/${user.id}/edit`}>
                                  Edit User
                                </Link>
                              </DropdownMenuItem>
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
    </>
  )
}
