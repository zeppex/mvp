import { NextResponse } from "next/server"
import { getPaymentOrder } from "@/lib/payment-db"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ posId: string }> }
) {
  const { posId } = await params;

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const order = await getPaymentOrder(posId);

  if (!order) {
    return NextResponse.json(
      { message: "Payment order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(order, {
    headers: {
      // Cache the response on Vercel's Edge Network for 3 seconds.
      // If a request comes after 3s, the stale response is served while
      // the function re-runs in the background to update the cache.
      "Cache-Control": "s-maxage=3, stale-while-revalidate=29",
    },
  });
}
