"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  Store,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface PaymentOrder {
  id: string;
  amount: string;
  description: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
  expiresIn?: number;
  pos: {
    id: string;
    name: string;
    description: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  merchant?: {
    id: string;
    name: string;
  };
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [selectedExchange, setSelectedExchange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentOrder = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        // The id parameter is actually a POS ID, so we need to get the current payment order for that POS
        const response = await fetch(
          `/api/public/payment-order/pos/${id}/current`
        );

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

    if (id) {
      fetchPaymentOrder();
    }
  }, [id]);

  const handleProceed = async () => {
    if (!selectedExchange || !paymentOrder) return;

    setIsProcessing(true);

    try {
      // Trigger payment processing in the backend
      const response = await fetch(
        `/api/public/payment-order/${paymentOrder.id}/trigger-in-progress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Payment processing failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(errorData.message || "Payment processing failed");
      }

      const result = await response.json();

      // Payment was successfully triggered
      setIsProcessing(false);
      setIsComplete(true);
    } catch (error) {
      console.error("Payment processing error:", error);
      setError(
        error instanceof Error ? error.message : "Payment processing failed"
      );
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading payment details...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Payment Not Found</h3>
              <p className="text-muted-foreground mb-4">
                {error || "No active payment order found for this POS"}
              </p>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">${paymentOrder.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Merchant</p>
                  <p className="font-medium">
                    {paymentOrder.merchant?.name || "Unknown Merchant"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{paymentOrder.description}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Payment Method
                  </p>
                  <p className="font-medium">{selectedExchange}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              Zeppex
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">
            Complete Your Payment
          </CardTitle>
          <CardDescription className="text-center">
            Select your preferred crypto exchange to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {paymentOrder.merchant?.name || "Unknown Merchant"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentOrder.branch?.name || "Unknown Branch"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">${paymentOrder.amount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{paymentOrder.description}</p>
              </div>
            </div>
            {paymentOrder.expiresIn && paymentOrder.expiresIn > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Expires in: {Math.floor(paymentOrder.expiresIn / 1000)}{" "}
                  seconds
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Crypto Exchange
            </label>
            <Select
              value={selectedExchange}
              onValueChange={(value) => {
                setSelectedExchange(value);
                setError(null); // Clear error when user selects a new exchange
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an exchange" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Binance Pay">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
                    Binance Pay
                  </div>
                </SelectItem>
                <SelectItem value="Coinbase">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                    Coinbase
                  </div>
                </SelectItem>
                <SelectItem value="Crypto.com">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                    Crypto.com
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={handleProceed}
            disabled={!selectedExchange || isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Proceed to Payment <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
