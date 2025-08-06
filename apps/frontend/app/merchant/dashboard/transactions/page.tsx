"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react";
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
import {
  ArrowDownIcon,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: string;
  exchange: string;
  merchantId: string;
  branchId: string;
  posId: string;
  paymentOrderId?: string;
  userId?: string;
  metadata?: any;
  externalTransactionId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/merchant/transactions");
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await response.json();

        // If no transactions from API, use mock data for demonstration
        if (data.length === 0) {
          const mockTransactions: Transaction[] = [
            {
              id: "tx-001",
              date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              description: "Coffee and pastry purchase",
              amount: "25.50",
              status: "completed",
              exchange: "Binance",
              merchantId: "merchant-001",
              branchId: "branch-001",
              posId: "pos-001",
              createdAt: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "tx-002",
              date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
              description: "Lunch special",
              amount: "12.99",
              status: "completed",
              exchange: "Binance",
              merchantId: "merchant-001",
              branchId: "branch-001",
              posId: "pos-001",
              createdAt: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "tx-003",
              date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
              description: "Grocery items",
              amount: "45.00",
              status: "pending",
              exchange: "Binance",
              merchantId: "merchant-001",
              branchId: "branch-001",
              posId: "pos-001",
              createdAt: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 6 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "tx-004",
              date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
              description: "Failed payment attempt",
              amount: "8.75",
              status: "failed",
              exchange: "Binance",
              merchantId: "merchant-001",
              branchId: "branch-001",
              posId: "pos-001",
              createdAt: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 8 * 60 * 60 * 1000
              ).toISOString(),
            },
            {
              id: "tx-005",
              date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
              description: "Electronics purchase",
              amount: "67.25",
              status: "completed",
              exchange: "Binance",
              merchantId: "merchant-001",
              branchId: "branch-001",
              posId: "pos-001",
              createdAt: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ];
          setTransactions(mockTransactions);
        } else {
          setTransactions(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    // Apply search filter
    const matchesSearch =
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" ||
      transaction.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefund = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRefundAmount(transaction.amount);
    setShowRefundDialog(true);
  };

  const processRefund = () => {
    // TODO: Implement refund functionality
    setTimeout(() => {
      setShowRefundDialog(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "refunded":
        return <ArrowDownIcon className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
            <p className="text-muted-foreground">Error loading transactions</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
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
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            View and manage your payment transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your transactions and their statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Exchange</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.id}
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(transaction.status)}
                          <span className="capitalize">
                            {transaction.status.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.exchange}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                navigator.clipboard.writeText(transaction.id)
                              }
                            >
                              Copy transaction ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {transaction.status.toLowerCase() ===
                              "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleRefund(transaction)}
                              >
                                Process refund
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>View details</DropdownMenuItem>
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

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Are you sure you want to process a refund for transaction{" "}
              {selectedTransaction?.id}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                step="0.01"
                min="0.01"
                max={selectedTransaction?.amount}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRefundDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={processRefund}>Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
