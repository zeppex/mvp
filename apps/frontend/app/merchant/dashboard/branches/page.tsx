"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Building2, MapPin, Phone, Users, Store } from "lucide-react"
import Link from "next/link"

interface Branch {
  id: string
  name: string
  address: string
  contactName: string
  contactPhone: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  posCount: number
  userCount: number
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    contactName: "",
    contactPhone: ""
  })

  // Mock data - replace with API call
  useEffect(() => {
    const mockBranches: Branch[] = [
      {
        id: "1",
        name: "Starbucks - Unicenter 2",
        address: "123 Main Street, Sample City, SC 12345",
        contactName: "John Sample",
        contactPhone: "+1234567890",
        isActive: true,
        createdAt: "2024-01-10T09:15:00Z",
        updatedAt: "2024-01-15T14:30:00Z",
        posCount: 3,
        userCount: 5
      },
      {
        id: "2",
        name: "Starbucks - Downtown Mall",
        address: "456 Downtown Ave, Sample City, SC 12345",
        contactName: "Sarah Wilson",
        contactPhone: "+1234567891",
        isActive: true,
        createdAt: "2024-01-12T11:20:00Z",
        updatedAt: "2024-01-16T10:45:00Z",
        posCount: 2,
        userCount: 3
      },
      {
        id: "3",
        name: "Starbucks - Airport Terminal",
        address: "789 Airport Blvd, Sample City, SC 12345",
        contactName: "Mike Johnson",
        contactPhone: "+1234567892",
        isActive: false,
        createdAt: "2024-01-14T16:00:00Z",
        updatedAt: "2024-01-17T09:15:00Z",
        posCount: 1,
        userCount: 2
      }
    ]
    setBranches(mockBranches)
    setLoading(false)
  }, [])

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateBranch = () => {
    // Mock branch creation - replace with API call
    const newBranchData: Branch = {
      id: Date.now().toString(),
      name: newBranch.name,
      address: newBranch.address,
      contactName: newBranch.contactName,
      contactPhone: newBranch.contactPhone,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posCount: 0,
      userCount: 0
    }
    setBranches([...branches, newBranchData])
    setNewBranch({ name: "", address: "", contactName: "", contactPhone: "" })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteBranch = (branchId: string) => {
    setBranches(branches.filter(branch => branch.id !== branchId))
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Branches Management</h2>
          <p className="text-muted-foreground">Manage your merchant branches and locations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
              <DialogDescription>
                Add a new branch location to your merchant account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="e.g., Starbucks - Downtown Mall"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder="Enter full address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    value={newBranch.contactName}
                    onChange={(e) => setNewBranch({ ...newBranch, contactName: e.target.value })}
                    placeholder="Branch manager name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={newBranch.contactPhone}
                    onChange={(e) => setNewBranch({ ...newBranch, contactPhone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateBranch}>
                Create Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">
              {branches.filter(b => b.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POS Terminals</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branches.reduce((sum, branch) => sum + branch.posCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branches.reduce((sum, branch) => sum + branch.userCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Staff members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {branches.filter(b => b.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {branches.filter(b => !b.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Branches</CardTitle>
              <CardDescription>A list of all branches in your merchant account</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>POS Terminals</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {branch.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[200px] truncate">{branch.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{branch.contactName}</div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {branch.contactPhone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {branch.posCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {branch.userCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.isActive ? "default" : "secondary"}>
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(branch.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/merchant/dashboard/branches/${branch.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBranch(branch.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 