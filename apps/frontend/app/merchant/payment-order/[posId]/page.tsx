"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Copy,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Pos {
  id: string;
  name: string;
  description: string;
  paymentLink: string;
  isActive: boolean;
  branch: {
    id: string;
    name: string;
  };
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  createdAt: string;
  expiresAt: string;
  paymentLink: string;
}

export default function CreatePaymentOrderPage() {
  const params = useParams();
  const router = useRouter();
  const posId = params.posId as string;
  const [pos, setPos] = useState<Pos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<PaymentOrder | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/payment-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posId: posId,
          amount: Math.round(amount * 100), // Convert to cents
          description: formData.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment order");
      }

      const result = await response.json();
      setCreatedOrder(result);
      toast.success("Payment order created successfully");
    } catch (error) {
      console.error("Error creating payment order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create payment order"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPaymentLink = async () => {
    if (createdOrder?.paymentLink) {
      try {
        await navigator.clipboard.writeText(createdOrder.paymentLink);
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
            <Link
              href={`/merchant/dashboard/branches/${pos?.branch.id}/pos/${posId}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            Create Payment Order
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

  if (createdOrder) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/merchant/dashboard/branches/${pos.branch.id}/pos/${posId}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Payment Order Created
            </h2>
            <p className="text-muted-foreground">
              Share this payment link with your customer
            </p>
          </div>
        </div>

        {/* Success Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Payment Order Successfully Created
            </CardTitle>
            <CardDescription>Order ID: {createdOrder.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Details */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Amount</div>
                <div className="text-2xl font-bold">
                  ${(createdOrder.amount / 100).toFixed(2)}{" "}
                  {createdOrder.currency}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <Badge variant="default">{createdOrder.status}</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Description</div>
              <div className="text-sm text-muted-foreground">
                {createdOrder.description}
              </div>
            </div>

            {/* Payment Link */}
            <div className="space-y-2">
              <div className="text-sm font-medium">Payment Link</div>
              <div className="flex items-center gap-2">
                <Input
                  value={createdOrder.paymentLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={copyPaymentLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button asChild>
                <a
                  href={createdOrder.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Payment Page
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedOrder(null);
                  setFormData({ amount: "", description: "" });
                }}
              >
                Create Another Order
              </Button>
            </div>

            {/* Order Info */}
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Created: {new Date(createdOrder.createdAt).toLocaleString()}
                </div>
                {createdOrder.expiresAt && (
                  <div>
                    Expires: {new Date(createdOrder.expiresAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link
            href={`/merchant/dashboard/branches/${pos.branch.id}/pos/${posId}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Create Payment Order
          </h2>
          <p className="text-muted-foreground">
            Create a new payment order for {pos.name}
          </p>
        </div>
      </div>

      {/* POS Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            POS Terminal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Terminal Name</div>
              <div className="text-sm text-muted-foreground">{pos.name}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Branch</div>
              <div className="text-sm text-muted-foreground">
                {pos.branch.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Order Form */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Order Details</CardTitle>
          <CardDescription>
            Enter the payment amount and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="pl-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter payment description (e.g., Coffee purchase, Service fee)"
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link
                  href={`/merchant/dashboard/branches/${pos.branch.id}/pos/${posId}`}
                >
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Payment Order"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
