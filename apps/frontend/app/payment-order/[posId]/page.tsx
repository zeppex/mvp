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
  Clock,
  Building,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  pos: {
    id: string;
    name: string;
    description: string;
  };
  branch: {
    id: string;
    name: string;
  };
  merchant: {
    id: string;
    name: string;
  };
}

export default function PublicPaymentOrderPage() {
  const params = useParams();
  const posId = params.posId as string;
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchPaymentOrder = async () => {
      try {
        const response = await fetch(`/api/public/payment-order/pos/${posId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch payment order");
        }
        const data = await response.json();
        setPaymentOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (posId) {
      fetchPaymentOrder();
    }
  }, [posId]);

  // Calculate time left until expiration
  useEffect(() => {
    if (!paymentOrder?.expiresAt) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(paymentOrder.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);
      setTimeLeft(remaining);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [paymentOrder?.expiresAt]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatTimeLeft = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return (
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="default">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="text-center mt-4 text-gray-600">
              Loading payment order...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || "Payment order not found"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = timeLeft !== null && timeLeft <= 0;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {formatCurrency(paymentOrder.amount, paymentOrder.currency)}
          </CardTitle>
          <CardDescription>
            {paymentOrder.description || "Payment Order"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status and Timer */}
          <div className="flex items-center justify-between">
            {getStatusBadge(paymentOrder.status)}
            {timeLeft !== null && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {isExpired ? "Expired" : formatTimeLeft(timeLeft)}
              </div>
            )}
          </div>

          {/* Merchant and Branch Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{paymentOrder.merchant.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{paymentOrder.branch.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span>{paymentOrder.pos.name}</span>
            </div>
          </div>

          {/* Payment Button */}
          {paymentOrder.status === "ACTIVE" && !isExpired && (
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <DollarSign className="mr-2 h-4 w-4" />
                Pay Now
              </Button>
              <p className="text-xs text-center text-gray-500">
                Click to proceed with payment
              </p>
            </div>
          )}

          {/* Expired or Completed Message */}
          {isExpired && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This payment order has expired. Please request a new one.
              </AlertDescription>
            </Alert>
          )}

          {paymentOrder.status === "COMPLETED" && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This payment has been completed successfully.
              </AlertDescription>
            </Alert>
          )}

          {/* Order Details */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Order Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Order ID: {paymentOrder.id}</div>
              <div>
                Created: {new Date(paymentOrder.createdAt).toLocaleString()}
              </div>
              {paymentOrder.expiresAt && (
                <div>
                  Expires: {new Date(paymentOrder.expiresAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
