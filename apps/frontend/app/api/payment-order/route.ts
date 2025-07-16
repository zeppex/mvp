import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { posId, amount, description } = body;

    if (!posId || !amount || !description) {
      return NextResponse.json(
        { message: "Missing required fields: posId, amount, description" },
        { status: 400 }
      );
    }

    // Create payment order
    const orderRes = await fetch(`${BACKEND_URL}/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify({
        posId,
        amount: amount.toString(),
        description,
      }),
    });

    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create payment order" },
        { status: orderRes.status }
      );
    }

    const order = await orderRes.json();

    // Generate payment link
    const paymentLink = `${
      process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"
    }/payment/${order.id}`;

    return NextResponse.json(
      {
        ...order,
        paymentLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
