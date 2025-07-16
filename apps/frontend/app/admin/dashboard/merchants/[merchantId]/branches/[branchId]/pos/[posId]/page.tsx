"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  MapPin,
  Clock,
  ArrowLeft,
  QrCode,
  ExternalLink,
  CheckCircle2,
  XCircle,
  DollarSign,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCode } from "@/components/ui/qr-code";

interface Pos {
  id: string;
  name: string;
  description: string;
  paymentLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branch: {
    id: string;
    name: string;
    address: string;
  };
  currentPaymentOrder?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  };
  transactions?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    completedAt?: string;
  }>;
}

export default function PosDetailPage() {
  const params = useParams();
  const merchantId = params.merchantId as string;
  const branchId = params.branchId as string;
  const posId = params.posId as string;
  const [pos, setPos] = useState<Pos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPos = async () => {
      try {
        const response = await fetch(
          `/api/pos/${posId}?merchantId=${merchantId}&branchId=${branchId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch POS");
        }
        const data = await response.json();
        setPos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (posId && merchantId && branchId) {
      fetchPos();
    }
  }, [posId, merchantId, branchId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !pos) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">POS Details</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{error || "POS not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return (
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "ACTIVE":
      case "IN_PROGRESS":
        return (
          <Badge variant="default">
            <Clock className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "CANCELLED":
      case "EXPIRED":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            {status === "CANCELLED" ? "Cancelled" : "Expired"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/admin/dashboard/merchants/${merchantId}/branches/${branchId}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{pos.name}</h2>
            <p className="text-muted-foreground">
              POS terminal details and transactions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pos.currentPaymentOrder &&
            pos.currentPaymentOrder.status === "ACTIVE" && (
              <Button asChild>
                <Link href={`/payment-order/${pos.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Payment Page
                </Link>
              </Button>
            )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={pos.isActive ? "default" : "secondary"}>
          {pos.isActive ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Active
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
        <span className="text-sm text-muted-foreground">POS ID: {pos.id}</span>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pos.transactions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {pos.transactions?.filter((t) => t.status === "COMPLETED")
                .length || 0}{" "}
              completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                pos.transactions?.reduce(
                  (sum, t) => (t.status === "COMPLETED" ? sum + t.amount : sum),
                  0
                ) || 0,
                "USD"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Transaction
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pos.currentPaymentOrder &&
              pos.currentPaymentOrder.status === "ACTIVE"
                ? "Active"
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {pos.currentPaymentOrder &&
              pos.currentPaymentOrder.status === "ACTIVE"
                ? formatCurrency(
                    pos.currentPaymentOrder.amount,
                    pos.currentPaymentOrder.currency
                  )
                : "No active transaction"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pos.transactions && pos.transactions.length > 0
                ? new Date(pos.transactions[0].createdAt).toLocaleDateString()
                : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {pos.transactions && pos.transactions.length > 0
                ? new Date(pos.transactions[0].createdAt).toLocaleTimeString()
                : "No transactions yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* POS Information */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>POS Information</CardTitle>
            <CardDescription>Terminal details and QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Terminal Name
                </div>
                <p className="text-sm text-muted-foreground">{pos.name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Branch
                </div>
                <p className="text-sm text-muted-foreground">
                  {pos.branch.name}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </div>
              <p className="text-sm text-muted-foreground">{pos.description}</p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Created
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(pos.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Last Updated
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(pos.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Payment Link */}
            {pos.paymentLink && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                    Payment Link
                  </div>
                  <div className="flex justify-center">
                    <div className="border rounded-lg p-4 bg-white">
                      <QRCode value={pos.paymentLink} size={200} level="M" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Scan this QR code to access the payment terminal
                  </p>
                  <div className="text-center">
                    <a
                      href={pos.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {pos.paymentLink}
                    </a>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pos.transactions && pos.transactions.length > 0 ? (
              pos.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No transactions found
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
