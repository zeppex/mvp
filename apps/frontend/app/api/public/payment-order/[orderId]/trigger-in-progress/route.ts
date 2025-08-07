import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const url = `${BACKEND_URL}/api/v1/public/payment-order/${orderId}/trigger-in-progress`;

    const apiKey = process.env.PAYMENT_API_KEY || "test-payment-api-key-12345";

    const apiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      console.error("Backend payment trigger failed:", {
        status: apiRes.status,
        statusText: apiRes.statusText,
        error: errorData,
      });
      return NextResponse.json(
        { message: errorData.message || "Failed to trigger payment" },
        { status: apiRes.status }
      );
    }

    const result = await apiRes.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Trigger payment error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
