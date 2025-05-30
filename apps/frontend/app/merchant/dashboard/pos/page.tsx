"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { QrCode } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function PointOfSale() {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [showQRCode, setShowQRCode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateQR = (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    // Simulate API call to generate QR code
    setTimeout(() => {
      setIsGenerating(false)
      setShowQRCode(true)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Point of Sale</h2>
        <p className="text-muted-foreground">Create a payment order for your customer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Payment Order</CardTitle>
          <CardDescription>Enter the payment details to generate a QR code for your customer</CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerateQR}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
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
            <div className="space-y-2">
              <Label htmlFor="pos">Point of Sale</Label>
              <Input id="pos" value="Starbucks - Unicenter 2" disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate QR Code"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment QR Code</DialogTitle>
            <DialogDescription>Have your customer scan this QR code to make a payment of ${amount}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-white p-4 rounded-lg">
              <QrCode className="h-48 w-48" />
            </div>
            <div className="mt-4 text-center">
              <p className="font-semibold">${amount}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowQRCode(false)}>
              Close
            </Button>
            <Button>Print QR Code</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
