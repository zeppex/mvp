"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
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
import { Building, CheckCircle2, Filter, MoreHorizontal, PauseCircle, Plus, Search, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import merchantApi, { type Merchant } from "@/lib/merchant-api"

export default function MerchantsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [pauseReason, setPauseReason] = useState("")
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch merchants on component mount
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await merchantApi.getAllMerchants()
        setMerchants(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch merchants')
      } finally {
        setLoading(false)
      }
    }

    fetchMerchants()
  }, [])

  const filteredMerchants = merchants.filter((merchant) => {
    // Apply search filter - using merchant.name and contact
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.contactName.toLowerCase().includes(searchQuery.toLowerCase())

    // Apply status filter - using isActive instead of status
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && merchant.isActive) || 
      (statusFilter === "paused" && !merchant.isActive)

    return matchesSearch && matchesStatus
  })

  const handlePause = (merchant: Merchant) => {
    setSelectedMerchant(merchant)
    setPauseReason("")
    setShowPauseDialog(true)
  }

  const confirmPause = async () => {
    if (!selectedMerchant) return
    
    try {
      // Update merchant status via API
      await merchantApi.updateMerchant(selectedMerchant.id, {
        ...selectedMerchant,
        isActive: false
      })
      
      // Update local state
      setMerchants(prev => 
        prev.map(m => 
          m.id === selectedMerchant.id 
            ? { ...m, isActive: false } 
            : m
        )
      )
      
      setShowPauseDialog(false)
    } catch (err) {
      console.error('Failed to pause merchant:', err)
    }
  }

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    } else {
      return <PauseCircle className="h-4 w-4 text-red-500" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Merchants</h2>
          <p className="text-muted-foreground">
            Manage merchants and their settings
          </p>
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
          <CardDescription>
            View and manage all merchants on the platform
          </CardDescription>
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
                  <TableHead>Branches</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading merchants...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-red-500"
                    >
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : filteredMerchants.length === 0 ? (
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
                          <div className="text-sm text-muted-foreground">
                            {merchant.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{merchant.branches?.length || 0}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {merchant.contactName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {merchant.contactPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{merchant.contact}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(merchant.isActive)}
                          <span className="capitalize">
                            {merchant.isActive ? "Active" : "Paused"}
                          </span>
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
                              <Link
                                href={`/admin/dashboard/merchants/${merchant.id}`}
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/dashboard/merchants/${merchant.id}/edit`}
                              >
                                Edit Merchant
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {merchant.isActive ? (
                              <DropdownMenuItem
                                onClick={() => handlePause(merchant)}
                              >
                                Pause Merchant
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                Resume Merchant
                              </DropdownMenuItem>
                            )}
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
              You are about to pause {selectedMerchant?.name}. This will prevent
              them from processing payments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                <Building className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-medium">{selectedMerchant?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMerchant?.address}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pause-reason">
                Reason for pausing (optional)
              </Label>
              <Input
                id="pause-reason"
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
              />
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
  );
}
