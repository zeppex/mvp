"use client"

import type React from "react"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCode, Plus, Store } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { QRCode } from "@/components/ui/qr-code"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PosTerminal {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  paymentLink: string;
  branch: {
    id: string;
    name: string;
  };
}

interface PaymentOrder {
  id: string;
  amount: string;
  description: string;
  status: string;
  paymentLink: string;
}

export default function PointOfSale() {
  const [posTerminals, setPosTerminals] = useState<PosTerminal[]>([]);
  const [selectedPos, setSelectedPos] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder | null>(null);

  useEffect(() => {
    const fetchPosTerminals = async () => {
      try {
        const response = await fetch("/api/merchant/pos");
        if (!response.ok) {
          throw new Error("Failed to fetch POS terminals");
        }
        const data = await response.json();
        setPosTerminals(data);
        if (data.length > 0) {
          setSelectedPos(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPosTerminals();
  }, []);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCurrentOrder(null);
    setShowQRCode(false);
    setError(null);
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const selectedPosTerminal = posTerminals.find(
        (pos) => pos.id === selectedPos
      );
      if (!selectedPosTerminal) {
        throw new Error("No POS terminal selected");
      }

      // Create payment order
      const response = await fetch("/api/payment-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          posId: selectedPos,
          amount: parseFloat(amount),
          description,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment order");
      }

      const order = await response.json();
      setCurrentOrder(order);
      setShowQRCode(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create payment order"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">Loading POS terminals...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
          <p className="text-muted-foreground">Error loading POS terminals</p>
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
        <p className="text-muted-foreground">
          Manage your POS terminals and create payment orders
        </p>
      </div>

      {posTerminals.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No POS Terminals</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any POS terminals yet. Create one to start
                accepting payments.
              </p>
              <Button asChild>
                <Link href="/merchant/dashboard/pos-terminals">
                  <Plus className="mr-2 h-4 w-4" />
                  Create POS Terminal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posTerminals.map((pos) => (
              <Card
                key={pos.id}
                className={selectedPos === pos.id ? "ring-2 ring-primary" : ""}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pos.name}</CardTitle>
                    <Badge variant={pos.isActive ? "default" : "secondary"}>
                      {pos.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>{pos.description}</CardDescription>
                  <p className="text-sm text-muted-foreground">
                    Branch: {pos.branch.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Payment Link:</strong>
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      {pos.paymentLink}
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedPos(pos.id)}
                  >
                    Select Terminal
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {selectedPos && (
            <Card>
              <CardHeader>
                <CardTitle>Create Payment Order</CardTitle>
                <CardDescription>
                  Enter the payment details to generate a QR code for your
                  customer
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleGenerateQR}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pos">Point of Sale Terminal</Label>
                    <Select value={selectedPos} onValueChange={setSelectedPos}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a POS terminal" />
                      </SelectTrigger>
                      <SelectContent>
                        {posTerminals.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name} - {pos.branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                        $
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        step="0.01"
                        min="0.01"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., 2 Venti Lattes"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isGenerating}
                  >
                    {isGenerating
                      ? "Creating Order..."
                      : "Create Payment Order"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </>
      )}

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>
              Have your customer scan this QR code to make a payment of $
              {currentOrder?.amount}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            {currentOrder?.paymentLink ? (
              <>
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={currentOrder.paymentLink}
                    size={192}
                    level="M"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-semibold">${currentOrder?.amount}</p>
                  <p className="text-sm text-gray-500">
                    {currentOrder?.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Order ID: {currentOrder?.id}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground">Loading payment link...</p>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowQRCode(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={resetForm}>
              Create New Order
            </Button>
            <Button>Print QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
