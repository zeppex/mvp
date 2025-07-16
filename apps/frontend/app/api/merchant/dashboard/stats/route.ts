import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user info to get merchantId
    const userRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user = await userRes.json();
    const merchantId = user.merchantId;

    if (!merchantId) {
      throw new Error("User has no merchant association");
    }

    // Fetch merchant details
    const merchantRes = await fetch(
      `${BACKEND_URL}/api/v1/merchants/${merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      }
    );

    if (!merchantRes.ok) {
      throw new Error("Failed to fetch merchant");
    }

    const merchant = await merchantRes.json();

    // Fetch payment orders for the merchant
    const ordersRes = await fetch(`${BACKEND_URL}/api/v1/orders`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    let orders = [];
    if (ordersRes.ok) {
      orders = await ordersRes.json();
    }

    // Fetch transactions for the merchant
    const transactionsRes = await fetch(`${BACKEND_URL}/api/v1/transactions`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    let transactions = [];
    if (transactionsRes.ok) {
      transactions = await transactionsRes.json();
    }

    // Calculate statistics
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    // Payment order statistics
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (order: any) => order.status === "COMPLETED"
    ).length;
    const pendingOrders = orders.filter(
      (order: any) =>
        order.status === "ACTIVE" || order.status === "IN_PROGRESS"
    ).length;
    const failedOrders = orders.filter(
      (order: any) => order.status === "FAILED" || order.status === "CANCELLED"
    ).length;

    // Today's orders
    const todayOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= todayStart && orderDate < todayEnd;
    });

    const todaySales = todayOrders
      .filter((order: any) => order.status === "COMPLETED")
      .reduce((sum: number, order: any) => sum + parseFloat(order.amount), 0);

    // Transaction statistics
    const totalTransactions = transactions.length;
    const completedTransactions = transactions.filter(
      (tx: any) => tx.status === "COMPLETED"
    ).length;
    const pendingTransactions = transactions.filter(
      (tx: any) => tx.status === "PENDING"
    ).length;
    const failedTransactions = transactions.filter(
      (tx: any) => tx.status === "FAILED"
    ).length;

    // Total volume
    const totalVolume =
      completedTransactions > 0
        ? transactions
            .filter((tx: any) => tx.status === "COMPLETED")
            .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0)
        : 0;

    // Recent transactions (last 5)
    const recentTransactions = transactions
      .sort(
        (a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5)
      .map((tx: any) => ({
        id: tx.id,
        amount: parseFloat(tx.amount).toFixed(2),
        status: tx.status,
        description: tx.description,
        date: tx.date,
        exchange: tx.exchange,
      }));

    // Payment method distribution (mock data for now)
    const paymentMethods = [
      { name: "Binance Pay", percentage: 68, color: "bg-blue-500" },
      { name: "Coinbase", percentage: 22, color: "bg-green-500" },
      { name: "Crypto.com", percentage: 10, color: "bg-purple-500" },
    ];

    return NextResponse.json({
      merchant: {
        id: merchant.id,
        name: merchant.name,
        address: merchant.address,
        contact: merchant.contact,
        contactName: merchant.contactName,
        contactPhone: merchant.contactPhone,
        isActive: merchant.isActive,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        failed: failedOrders,
        todaySales: todaySales.toFixed(2),
        todayCount: todayOrders.length,
      },
      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        totalVolume: totalVolume.toFixed(2),
      },
      recentTransactions,
      paymentMethods,
    });
  } catch (error) {
    console.error("Merchant dashboard stats error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
