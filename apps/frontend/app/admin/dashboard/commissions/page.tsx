"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Building, Percent, Save, Search } from "lucide-react"

// Mock merchant data
const merchants = [
  {
    id: "M001",
    name: "Starbucks",
    branch: "Unicenter 2",
    commission: 1.5,
    cashback: 0.5,
    status: "active",
  },
  {
    id: "M002",
    name: "Howtradethat",
    branch: "Main Branch",
    commission: 2.0,
    cashback: 1.0,
    status: "active",
  },
  {
    id: "M003",
    name: "Tech Gadgets Inc",
    branch: "Downtown",
    commission: 1.8,
    cashback: 0.8,
    status: "active",
  },
  {
    id: "M004",
    name: "Fitness First",
    branch: "North",
    commission: 1.2,
    cashback: 0.3,
    status: "pending",
  },
  {
    id: "M005",
    name: "Organic Foods",
    branch: "Central",
    commission: 1.7,
    cashback: 0.7,
    status: "active",
  },
]

export default function CommissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)
  const [commission, setCommission] = useState("")
  const [cashback, setCashback] = useState("")

  const filteredMerchants = merchants.filter(
    (merchant) =>
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.branch.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEdit = (merchant: any) => {
    setSelectedMerchant(merchant)
    setCommission(merchant.commission.toString())
    setCashback(merchant.cashback.toString())
    setShowEditDialog(true)
  }

  const saveChanges = () => {
    // Simulate saving changes
    setTimeout(() => {
      setShowEditDialog(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Commission & Cashback Settings</h2>
          <p className="text-muted-foreground">Manage commission and cashback rates for merchants</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Merchant Settings</CardTitle>
          <CardDescription>Configure commission and cashback percentages for each merchant</CardDescription>
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Commission (%)</TableHead>
                  <TableHead>Cashback (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMerchants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No merchants found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMerchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">{merchant.name}</TableCell>
                      <TableCell>{merchant.branch}</TableCell>
                      <TableCell>{merchant.commission.toFixed(1)}%</TableCell>
                      <TableCell>{merchant.cashback.toFixed(1)}%</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            merchant.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          }`}
                        >
                          {merchant.status === "active" ? "Active" : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(merchant)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Commission & Cashback</DialogTitle>
            <DialogDescription>
              Update the commission and cashback rates for {selectedMerchant?.name} - {selectedMerchant?.branch}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedMerchant?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMerchant?.branch}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Commission Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="commission"
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                The percentage fee charged to the merchant for each transaction
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cashback">Cashback Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cashback"
                  type="number"
                  value={cashback}
                  onChange={(e) => setCashback(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
              <p className="text-sm text-muted-foreground">The percentage returned to customers as cashback rewards</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveChanges}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
