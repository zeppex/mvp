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

    // Fetch transactions for the merchant
    const transactionsRes = await fetch(`${BACKEND_URL}/api/v1/transactions`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!transactionsRes.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const transactions = await transactionsRes.json();
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
