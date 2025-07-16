import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: { posId: string } }
) {
  try {
    const url = `${BACKEND_URL}/api/v1/public/pos/${params.posId}/orders/current`;

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
