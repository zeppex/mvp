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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Store,
  Building2,
  QrCode,
  AlertCircle,
} from "lucide-react";
import Link from "next/link"
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  address: string;
}

interface PosTerminal {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  paymentLink: string;
  branchId: string;
  branch: Branch;
  createdAt: string;
  updatedAt: string;
}

export default function PosTerminalsPage() {
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([])
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false);
  const [newPosTerminal, setNewPosTerminal] = useState({
    name: "",
    description: "",
    branchId: ""
  })

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [posResponse, branchesResponse] = await Promise.all([
        fetch("/api/merchant/pos"),
        fetch("/api/merchant/branches"),
      ]);

      if (!posResponse.ok) {
        throw new Error("Failed to fetch POS terminals");
      }
      if (!branchesResponse.ok) {
        throw new Error("Failed to fetch branches");
      }

      const [posData, branchesData] = await Promise.all([
        posResponse.json(),
        branchesResponse.json(),
      ]);

      setPosTerminals(posData);
      setBranches(branchesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePosTerminal = async () => {
    if (
      !newPosTerminal.name ||
      !newPosTerminal.description ||
      !newPosTerminal.branchId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/merchant/pos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPosTerminal),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create POS terminal");
      }

      const createdPosTerminal = await response.json();
      setPosTerminals([...posTerminals, createdPosTerminal]);
      setNewPosTerminal({ name: "", description: "", branchId: "" });
      setIsCreateDialogOpen(false);
      toast.success("POS terminal created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create POS terminal"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePosTerminal = async (posId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this POS terminal? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/merchant/pos/${posId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete POS terminal");
      }

      setPosTerminals(posTerminals.filter((pos) => pos.id !== posId));
      toast.success("POS terminal deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete POS terminal"
      );
    }
  };

  const filteredPosTerminals = posTerminals.filter(
    (pos) =>
      pos.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              POS Terminals Management
            </h2>
            <p className="text-muted-foreground">Loading POS terminals...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              POS Terminals Management
            </h2>
            <p className="text-muted-foreground">Error loading POS terminals</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchData}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            POS Terminals Management
          </h2>
          <p className="text-muted-foreground">
            Manage your point of sale terminals
          </p>
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
                <Label htmlFor="name">Terminal Name *</Label>
                <Input
                  id="name"
                  value={newPosTerminal.name}
                  onChange={(e) =>
                    setNewPosTerminal({
                      ...newPosTerminal,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g., Cash Register 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newPosTerminal.description}
                  onChange={(e) =>
                    setNewPosTerminal({
                      ...newPosTerminal,
                      description: e.target.value,
                    })
                  }
                  placeholder="Brief description of the terminal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch *</Label>
                <Select
                  value={newPosTerminal.branchId}
                  onValueChange={(value) =>
                    setNewPosTerminal({ ...newPosTerminal, branchId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePosTerminal} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Terminal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Terminals
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posTerminals.length}</div>
            <p className="text-xs text-muted-foreground">
              {posTerminals.filter((p) => p.isActive).length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Terminals
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {posTerminals.filter((p) => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {posTerminals.filter((p) => !p.isActive).length} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Branches with POS
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(posTerminals.map((p) => p.branchId)).size}
            </div>
            <p className="text-xs text-muted-foreground">Branches covered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Terminals
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                posTerminals.filter((p) => {
                  const createdAt = new Date(p.createdAt);
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  return createdAt > oneMonthAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Added this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>POS Terminals</CardTitle>
              <CardDescription>
                A list of all POS terminals in your merchant account
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search terminals..."
                  className="pl-8 w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Terminal Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosTerminals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-center">
                        <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          No POS terminals found
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm
                            ? "No terminals match your search criteria."
                            : "You haven't created any POS terminals yet."}
                        </p>
                        {!searchTerm && (
                          <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Terminal
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosTerminals.map((pos) => (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.name}</TableCell>
                      <TableCell>{pos.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {pos.branch.name}
                        </div>
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
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/merchant/dashboard/pos-terminals/${pos.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePosTerminal(pos.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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