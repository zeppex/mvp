import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: { posId: string } }
) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/public/payment-order/pos/${params.posId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch payment order" },
        { status: response.status }
      );
    }

    const paymentOrder = await response.json();
    return NextResponse.json(paymentOrder);
  } catch (error) {
    console.error("Fetch payment order error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
