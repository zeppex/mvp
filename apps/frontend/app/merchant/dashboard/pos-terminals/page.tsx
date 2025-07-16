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
import { Plus, Search, Edit, Trash2, Store, Building2, QrCode, Copy, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PosTerminal {
  id: string
  name: string
  description: string
  branchId: string
  branchName: string
  paymentLink: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  transactionCount: number
  totalAmount: number
}

export default function PosTerminalsPage() {
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPosTerminal, setNewPosTerminal] = useState({
    name: "",
    description: "",
    branchId: ""
  })

  // Mock data - replace with API call
  useEffect(() => {
    const mockPosTerminals: PosTerminal[] = [
      {
        id: "1",
        name: "POS Terminal 1",
        description: "Main counter terminal",
        branchId: "1",
        branchName: "Starbucks - Unicenter 2",
        paymentLink: "https://zeppex.com/payment/pos1",
        isActive: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-20T14:45:00Z",
        transactionCount: 156,
        totalAmount: 2340.50
      },
      {
        id: "2",
        name: "POS Terminal 2",
        description: "Drive-thru terminal",
        branchId: "1",
        branchName: "Starbucks - Unicenter 2",
        paymentLink: "https://zeppex.com/payment/pos2",
        isActive: true,
        createdAt: "2024-01-16T11:15:00Z",
        updatedAt: "2024-01-21T09:30:00Z",
        transactionCount: 89,
        totalAmount: 1345.75
      },
      {
        id: "3",
        name: "POS Terminal 3",
        description: "Mobile terminal",
        branchId: "1",
        branchName: "Starbucks - Unicenter 2",
        paymentLink: "https://zeppex.com/payment/pos3",
        isActive: false,
        createdAt: "2024-01-17T16:00:00Z",
        updatedAt: "2024-01-22T12:20:00Z",
        transactionCount: 23,
        totalAmount: 345.25
      },
      {
        id: "4",
        name: "POS Terminal 1",
        description: "Main counter",
        branchId: "2",
        branchName: "Starbucks - Downtown Mall",
        paymentLink: "https://zeppex.com/payment/pos4",
        isActive: true,
        createdAt: "2024-01-18T09:45:00Z",
        updatedAt: "2024-01-23T15:10:00Z",
        transactionCount: 67,
        totalAmount: 987.30
      }
    ]
    setPosTerminals(mockPosTerminals)
    setLoading(false)
  }, [])

  const filteredPosTerminals = posTerminals.filter(pos =>
    pos.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pos.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pos.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreatePosTerminal = () => {
    // Mock POS terminal creation - replace with API call
    const newPosTerminalData: PosTerminal = {
      id: Date.now().toString(),
      name: newPosTerminal.name,
      description: newPosTerminal.description,
      branchId: newPosTerminal.branchId,
      branchName: "Starbucks - Unicenter 2", // Mock branch name
      paymentLink: `https://zeppex.com/payment/pos${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      transactionCount: 0,
      totalAmount: 0
    }
    setPosTerminals([...posTerminals, newPosTerminalData])
    setNewPosTerminal({ name: "", description: "", branchId: "" })
    setIsCreateDialogOpen(false)
  }

  const handleDeletePosTerminal = (posId: string) => {
    setPosTerminals(posTerminals.filter(pos => pos.id !== posId))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">POS Terminals Management</h2>
          <p className="text-muted-foreground">Manage your point of sale terminals and payment links</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add POS Terminal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New POS Terminal</DialogTitle>
              <DialogDescription>
                Add a new point of sale terminal to your merchant account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Terminal Name</Label>
                <Input
                  id="name"
                  value={newPosTerminal.name}
                  onChange={(e) => setNewPosTerminal({ ...newPosTerminal, name: e.target.value })}
                  placeholder="e.g., POS Terminal 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPosTerminal.description}
                  onChange={(e) => setNewPosTerminal({ ...newPosTerminal, description: e.target.value })}
                  placeholder="Brief description of the terminal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  value={newPosTerminal.branchId}
                  onChange={(e) => setNewPosTerminal({ ...newPosTerminal, branchId: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a branch</option>
                  <option value="1">Starbucks - Unicenter 2</option>
                  <option value="2">Starbucks - Downtown Mall</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePosTerminal}>
                Create Terminal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POS Terminals</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posTerminals.length}</div>
            <p className="text-xs text-muted-foreground">
              {posTerminals.filter(p => p.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posTerminals.reduce((sum, pos) => sum + pos.transactionCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Across all terminals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${posTerminals.reduce((sum, pos) => sum + pos.totalAmount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From all terminals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Terminals</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posTerminals.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {posTerminals.filter(p => !p.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>POS Terminals</CardTitle>
              <CardDescription>A list of all POS terminals in your merchant account</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terminals..."
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
                <TableHead>Terminal Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Payment Link</TableHead>
                <TableHead>Transactions</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosTerminals.map((pos) => (
                <TableRow key={pos.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {pos.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="max-w-[200px] truncate block">{pos.description}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {pos.branchName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="max-w-[200px] truncate text-sm">{pos.paymentLink}</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(pos.paymentLink)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={pos.paymentLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      {pos.transactionCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${pos.totalAmount.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pos.isActive ? "default" : "secondary"}>
                      {pos.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(pos.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/merchant/dashboard/pos-terminals/${pos.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeletePosTerminal(pos.id)}>
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