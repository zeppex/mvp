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

interface PaymentOrder {
  id: string;
  amount: string;
  description: string;
  status:
    | "PENDING"
    | "ACTIVE"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | "QUEUED";
  exchange: "binance" | "coinbase" | "kraken";
  branchId: string;
  posId: string;
  metadata?: any;
  externalTransactionId?: string;
  errorMessage?: string;
  expiresAt?: string;
  deactivatedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  pos?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
}

export default function TransactionsPage() {
  const [paymentOrders, setPaymentOrders] = useState<PaymentOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPaymentOrder, setSelectedPaymentOrder] =
    useState<PaymentOrder | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/merchant/payment-orders");
      if (!response.ok) {
        throw new Error("Failed to fetch payment orders");
      }
      const data = await response.json();
      setPaymentOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentOrders();
  }, []);

  const filteredPaymentOrders = paymentOrders.filter((paymentOrder) => {
    // Apply search filter
    const matchesSearch =
      paymentOrder.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paymentOrder.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (paymentOrder.externalTransactionId &&
        paymentOrder.externalTransactionId
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    // Apply status filter
    const matchesStatus =
      statusFilter === "all" ||
      paymentOrder.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRefund = (paymentOrder: PaymentOrder) => {
    setSelectedPaymentOrder(paymentOrder);
    setRefundAmount(paymentOrder.amount);
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
      case "queued":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "active":
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "cancelled":
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatExchange = (exchange: string) => {
    return exchange.charAt(0).toUpperCase() + exchange.slice(1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Payment Orders
            </h2>
            <p className="text-muted-foreground">Loading payment orders...</p>
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
            <h2 className="text-2xl font-bold tracking-tight">
              Payment Orders
            </h2>
            <p className="text-muted-foreground">
              Error loading payment orders
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchPaymentOrders}>Retry</Button>
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
          <h2 className="text-2xl font-bold tracking-tight">Payment Orders</h2>
          <p className="text-muted-foreground">
            View and manage your payment orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchPaymentOrders}>
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
          <CardTitle>Payment Order History</CardTitle>
          <CardDescription>
            View all your payment orders and their statuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payment orders..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Exchange</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPaymentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {paymentOrders.length === 0
                        ? "No payment orders found"
                        : "No payment orders match your filters"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPaymentOrders.map((paymentOrder) => (
                    <TableRow key={paymentOrder.id}>
                      <TableCell className="font-medium">
                        {paymentOrder.id}
                      </TableCell>
                      <TableCell>
                        {formatDate(paymentOrder.createdAt)}
                      </TableCell>
                      <TableCell>{paymentOrder.description}</TableCell>
                      <TableCell>
                        ${parseFloat(paymentOrder.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(paymentOrder.status)}
                          <span className="capitalize">
                            {paymentOrder.status
                              .toLowerCase()
                              .replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatExchange(paymentOrder.exchange)}
                      </TableCell>
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
                                navigator.clipboard.writeText(paymentOrder.id)
                              }
                            >
                              Copy order ID
                            </DropdownMenuItem>
                            {paymentOrder.externalTransactionId && (
                              <DropdownMenuItem
                                onClick={() =>
                                  navigator.clipboard.writeText(
                                    paymentOrder.externalTransactionId!
                                  )
                                }
                              >
                                Copy external ID
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {paymentOrder.status.toLowerCase() ===
                              "completed" && (
                              <DropdownMenuItem
                                onClick={() => handleRefund(paymentOrder)}
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
              Are you sure you want to process a refund for payment order{" "}
              {selectedPaymentOrder?.id}?
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
                max={selectedPaymentOrder?.amount}
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
