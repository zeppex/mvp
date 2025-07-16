// --- Mock Database and State Simulation for Payment Orders ---
// This file simulates a database and its interactions.

interface Order {
  merchantName: string
  merchantBranch: string
  totalAmount: number
  currency: string
  items: { name: string; quantity: number; price: number }[]
  status: "waiting" | "processing" | "completed" | "failed"
}

// In-memory "database table" for orders
const orders: { [key: string]: Order } = {
  "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d": {
    merchantName: "Starbucks",
    merchantBranch: "Unicenter 2",
    totalAmount: 10.0,
    currency: "USD",
    items: [{ name: "Venti Latte", quantity: 2, price: 5.0 }],
    status: "waiting",
  },
}

// In-memory state tracker for the demo lifecycle.
// NOTE: This is NOT production-ready. Use a persistent store like Redis or
// update the status in your main database in a real application.
const orderStatusTracker: { [key: string]: number } = {}
const statusLifecycle = ["waiting", "processing", "completed", "failed"]

export const getPaymentOrder = async (posId: string): Promise<Order | null> => {
  const order = orders[posId]
  if (!order) {
    return null
  }

  // Initialize tracker if it doesn't exist
  if (orderStatusTracker[posId] === undefined) {
    orderStatusTracker[posId] = 0
  }

  // Get current status from our simulated state
  const currentStatus = statusLifecycle[orderStatusTracker[posId]] as Order["status"]

  // Increment the status for the next poll, stopping at a terminal state
  if (currentStatus !== "completed" && currentStatus !== "failed") {
    orderStatusTracker[posId] = (orderStatusTracker[posId] + 1) % statusLifecycle.length
  }

  return { ...order, status: currentStatus }
}
