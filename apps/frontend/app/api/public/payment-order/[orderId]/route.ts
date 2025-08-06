import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // First, we need to get the payment order details from the backend
    // Since there's no public endpoint for fetching by order ID, we'll need to create one
    // For now, let's use the existing endpoint structure but we'll need to modify the backend

    const url = `${BACKEND_URL}/api/v1/public/payment-order/${orderId}`;

    const apiRes = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch payment order" },
        { status: apiRes.status }
      );
    }

    const paymentOrder = await apiRes.json();
    return NextResponse.json(paymentOrder);
  } catch (error) {
    console.error("Fetch payment order error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
