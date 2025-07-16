"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle2, XCircle, QrCode, AlertCircle, Store } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// --- UI Components for different statuses ---

const StatusWaiting = ({ order }: { order: any }) => (
  <div className="flex flex-col items-center text-center">
    <p className="text-muted-foreground mb-4">Scan the QR code to pay</p>
    <div className="bg-white p-4 rounded-lg border">
      <QrCode className="h-40 w-40 text-black" />
    </div>
    <div className="mt-4">
      <p className="text-3xl font-bold">${order.totalAmount.toFixed(2)}</p>
      <p className="text-muted-foreground">
        {order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(", ")}
      </p>
    </div>
  </div>
)

const StatusProcessing = () => (
  <div className="flex flex-col items-center text-center space-y-4">
    <Loader2 className="h-16 w-16 animate-spin text-primary" />
    <p className="text-lg font-semibold">Processing Payment</p>
    <p className="text-muted-foreground">Please wait, we are confirming your transaction...</p>
  </div>
)

const StatusCompleted = () => (
  <div className="flex flex-col items-center text-center space-y-4">
    <CheckCircle2 className="h-16 w-16 text-green-500" />
    <p className="text-lg font-semibold">Payment Successful</p>
    <p className="text-muted-foreground">Your payment has been confirmed. Thank you!</p>
  </div>
)

const StatusFailed = () => (
  <div className="flex flex-col items-center text-center space-y-4">
    <XCircle className="h-16 w-16 text-red-500" />
    <p className="text-lg font-semibold">Payment Failed</p>
    <p className="text-muted-foreground">There was an issue with your payment. Please try again.</p>
  </div>
)

// --- Main Page Component ---

export default function PaymentOrderPage({ params }: { params: { posId: string } }) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  let interval: NodeJS.Timeout | null = null

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await fetch(`/api/payment-order/${params.posId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Error: ${response.status}`)
        }

        const data = await response.json()
        setOrder(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch order details.")
        // Stop polling on error
        if (interval) clearInterval(interval)
      } finally {
        // Only set loading to false on the first load
        if (loading) {
          setLoading(false)
        }
      }
    }

    getOrder()

    // Set up polling to check for status updates every 3 seconds
    interval = setInterval(getOrder, 3000)

    // Clean up the interval on component unmount
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [params.posId])

  const renderStatusComponent = () => {
    if (!order) return null
    switch (order.status) {
      case "waiting":
        return <StatusWaiting order={order} />
      case "processing":
        return <StatusProcessing />
      case "completed":
        return <StatusCompleted />
      case "failed":
        return <StatusFailed />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">{order?.merchantName}</CardTitle>
              <CardDescription>{order?.merchantBranch}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="py-6 min-h-[280px] flex items-center justify-center">
          {renderStatusComponent()}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-xs text-muted-foreground">POS ID: {params.posId}</p>
          <Button variant="link" asChild>
            <Link href="/">Powered by Zeppex</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
