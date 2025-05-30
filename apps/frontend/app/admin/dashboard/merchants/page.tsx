"use client"

import { Label } from "@/components/ui/label"

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
import { Building, CheckCircle2, Clock, Filter, MoreHorizontal, PauseCircle, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Mock merchant data
const merchants = [
  {
    id: "M001",
    name: "Starbucks",
    branch: "Unicenter 2",
    locations: 1,
    transactions: 245,
    volume: 2450.75,
    status: "active",
    createdAt: "2025-01-15T10:00:00",
  },
  {
    id: "M002",
    name: "Howtradethat",
    branch: "Main Branch",
    locations: 3,
    transactions: 187,
    volume: 5621.5,
    status: "active",
    createdAt: "2025-02-20T14:30:00",
  },
  {
    id: "M003",
    name: "Tech Gadgets Inc",
    branch: "Downtown",
    locations: 1,
    transactions: 92,
    volume: 8750.25,
    status: "active",
    createdAt: "2025-03-10T09:15:00",
  },
  {
    id: "M004",
    name: "Fitness First",
    branch: "North",
    locations: 2,
    transactions: 0,
    volume: 0,
    status: "pending",
    createdAt: "2025-05-12T11:45:00",
  },
  {
    id: "M005",
    name: "Organic Foods",
    branch: "Central",
    locations: 1,
    transactions: 56,
    volume: 1250.8,
    status: "paused",
    createdAt: "2025-04-05T16:20:00",
  },
]

export default function MerchantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)
  const [pauseReason, setPauseReason] = useState("")

  const filteredMerchants = merchants.filter((merchant) => {
    // Apply search filter
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.branch.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply status filter
    const matchesStatus = statusFilter === "all" || merchant.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handlePause = (merchant: any) => {
    setSelectedMerchant(merchant)
    setPauseReason("")
    setShowPauseDialog(true)
  }

  const confirmPause = () => {
    // Simulate pausing merchant
    setTimeout(() => {
      setShowPauseDialog(false)
    }, 500)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "paused":
        return <PauseCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchants</h2>
          <p className="text-muted-foreground">Manage merchants and their settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/dashboard/merchants/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Merchant
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchant List</CardTitle>
          <CardDescription>View and manage all merchants on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search merchants..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Locations</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No merchants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{merchant.name}</div>
                          <div className="text-sm text-muted-foreground">{merchant.branch}</div>
                        </div>
                      </TableCell>
                      <TableCell>{merchant.locations}</TableCell>
                      <TableCell>{merchant.transactions}</TableCell>
                      <TableCell>${merchant.volume.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(merchant.status)}
                          <span className="capitalize">{merchant.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(merchant.createdAt)}</TableCell>
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
                              <Link href={`/admin/dashboard/merchants/${merchant.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/dashboard/merchants/${merchant.id}/edit`}>Edit Merchant</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {merchant.status === "active" ? (
                              <DropdownMenuItem onClick={() => handlePause(merchant)}>Pause Merchant</DropdownMenuItem>
                            ) : merchant.status === "paused" ? (
                              <DropdownMenuItem>Resume Merchant</DropdownMenuItem>
                            ) : null}
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

      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Merchant</DialogTitle>
            <DialogDescription>
              You are about to pause {selectedMerchant?.name} - {selectedMerchant?.branch}. This will prevent them from
              processing payments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                <Building className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium">{selectedMerchant?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMerchant?.branch}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pause-reason">Reason for pausing (optional)</Label>
              <Input id="pause-reason" value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmPause}>
              <PauseCircle className="mr-2 h-4 w-4" />
              Pause Merchant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
