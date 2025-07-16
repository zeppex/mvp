"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react";
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
  Building,
  CheckCircle2,
  Clock,
  Filter,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Search,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEffect } from "react";

interface Merchant {
  id: string;
  name: string;
  // TODO: The backend does not return the branch, locations, transactions, and volume
  branch: string;
  locations: number;
  transactions: number;
  volume: number;
  status: "active" | "pending" | "paused";
  createdAt: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [pauseReason, setPauseReason] = useState("");

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await fetch("/api/merchants");
        if (!response.ok) {
          throw new Error("Failed to fetch merchants");
        }
        const data = await response.json();
        const merchants = data.map((merchant: any) => ({
          id: merchant.id,
          name: merchant.name,
          // TODO: The backend does not return the branch, locations, transactions, and volume
          branch: "Main Branch",
          locations: 1,
          transactions: 0,
          volume: 0,
          status: merchant.isActive ? "active" : "pending",
          createdAt: merchant.createdAt,
        }));
        setMerchants(merchants);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter((merchant) => {
    // Apply search filter
    const matchesSearch =
      merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.branch.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" || merchant.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePause = (merchant: any) => {
    setSelectedMerchant(merchant);
    setPauseReason("");
    setShowPauseDialog(true);
  };

  const confirmPause = () => {
    // Simulate pausing merchant
    setTimeout(() => {
      setShowPauseDialog(false);
    }, 500);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "paused":
        return <PauseCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

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
                          <div className="text-sm text-muted-foreground">
                            {merchant.branch}
                          </div>
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
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/dashboard/merchants/${merchant.id}/users`}
                              >
                                Manage Users
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {merchant.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handlePause(merchant)}
                              >
                                Pause Merchant
                              </DropdownMenuItem>
                            ) : merchant.status === "paused" ? (
                              <DropdownMenuItem>
                                Resume Merchant
                              </DropdownMenuItem>
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
              You are about to pause {selectedMerchant?.name} -{" "}
              {selectedMerchant?.branch}. This will prevent them from processing
              payments.
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
                  {selectedMerchant?.branch}
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
