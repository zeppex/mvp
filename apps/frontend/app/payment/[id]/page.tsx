"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, CheckCircle2, Store, AlertCircle } from "lucide-react";
import Link from "next/link"

export default function PaymentPage({ params }: { params: { id: string } }) {
  const [selectedExchange, setSelectedExchange] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse the URL to determine the format
  const pathSegments = params.id.split("/");
  const isSimplifiedFormat = pathSegments.length === 1;
  const posId = isSimplifiedFormat ? pathSegments[0] : pathSegments[2];
  const merchantId = isSimplifiedFormat ? null : pathSegments[0];
  const branchId = isSimplifiedFormat ? null : pathSegments[1];

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Determine the API endpoint based on the URL format
        let apiUrl: string;
        if (isSimplifiedFormat) {
          // New simplified format: /api/v1/public/pos/{posId}/orders/current
          apiUrl = `/api/v1/public/pos/${posId}/orders/current`;
        } else {
          // Legacy format: /api/v1/public/merchants/{merchantId}/branches/{branchId}/pos/{posId}/orders/current
          apiUrl = `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("No active payment order found");
          }
          throw new Error("Failed to fetch payment data");
        }

        const data = await response.json();
        setPaymentData({
          id: data.id,
          amount: parseFloat(data.amount),
          description: data.description,
          merchant: data.pos?.branch?.merchant?.name || "Unknown Merchant",
          branch: data.pos?.branch?.name || "Unknown Branch",
          pos: data.pos?.name || "Unknown POS",
          created: data.createdAt,
          expiresIn: data.expiresIn,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, [posId, merchantId, branchId, isSimplifiedFormat]);

  const handleProceed = async () => {
    if (!selectedExchange || !paymentData) return;

    setIsProcessing(true);

    try {
      // Determine the API endpoint for triggering payment
      let apiUrl: string;
      if (isSimplifiedFormat) {
        // New simplified format
        apiUrl = `/api/v1/public/pos/${posId}/orders/${paymentData.id}/trigger-in-progress`;
      } else {
        // Legacy format
        apiUrl = `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${paymentData.id}/trigger-in-progress`;
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-payment-api-key-12345", // This should come from environment or user session
        },
      });

      if (!response.ok) {
        throw new Error("Failed to process payment");
      }

      // Simulate additional payment processing
      setTimeout(() => {
        setIsProcessing(false);
        setIsComplete(true);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed"
      );
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading payment details...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Payment Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
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
                  <p className="font-medium">
                    ${paymentData?.amount.toFixed(2)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Merchant</p>
                  <p className="font-medium">{paymentData?.merchant}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{paymentData?.description}</p>
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
                <p className="font-medium">{paymentData?.merchant}</p>
                <p className="text-sm text-muted-foreground">
                  {paymentData?.branch} - {paymentData?.pos}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-medium">${paymentData?.amount.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{paymentData?.description}</p>
              </div>
            </div>
            {paymentData?.expiresIn && (
              <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⏰ This payment expires in{" "}
                  {Math.ceil(paymentData.expiresIn / 1000)} seconds
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
              onValueChange={setSelectedExchange}
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

