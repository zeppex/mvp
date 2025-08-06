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
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  QrCode,
  Copy,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Pos {
  id: string;
  name: string;
  description: string;
  paymentLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branchId: string;
}

export default function PosDetailPage() {
  const params = useParams();
  const branchId = params.branchId as string;
  const posId = params.posId as string;
  const [pos, setPos] = useState<Pos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPos = async () => {
      try {
        const response = await fetch(`/api/merchant/pos/${posId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch POS terminal");
        }
        const data = await response.json();
        setPos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (posId) {
      fetchPos();
    }
  }, [posId]);

  const copyPaymentLink = async () => {
    if (pos?.paymentLink) {
      try {
        await navigator.clipboard.writeText(pos.paymentLink);
        toast.success("Payment link copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy payment link");
      }
    }
  };

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
            <Link href={`/merchant/dashboard/branches/${branchId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            POS Terminal Details
          </h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {error || "POS terminal not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/merchant/dashboard/branches/${branchId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{pos.name}</h2>
            <p className="text-muted-foreground">
              POS terminal details and payment information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/merchant/payment-order/${pos.id}`}>
              <CreditCard className="mr-2 h-4 w-4" />
              Create Payment
            </Link>
          </Button>
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
              <Clock className="mr-1 h-3 w-3" />
              Inactive
            </>
          )}
        </Badge>
        <span className="text-sm text-muted-foreground">POS ID: {pos.id}</span>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">No volume yet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Quick Actions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700"
              asChild
            >
              <Link href={`/merchant/payment-order/${posId}`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Create Payment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* POS Information */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>POS Terminal Information</CardTitle>
            <CardDescription>Basic details and configuration</CardDescription>
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
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Description
                </div>
                <p className="text-sm text-muted-foreground">
                  {pos.description}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Payment link and QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                Payment Link
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground font-mono truncate">
                  {pos.paymentLink}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPaymentLink}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                Test Payment
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href={pos.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Payment Page
                </a>
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Create New Payment
              </div>
              <Button size="sm" asChild>
                <Link href={`/merchant/payment-order/${pos.id}`}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Create Payment Order
                </Link>
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                QR Code
              </div>
              <div className="text-center py-4">
                <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  QR code for {pos.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
