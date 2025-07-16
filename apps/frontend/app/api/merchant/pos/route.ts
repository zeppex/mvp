import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch POS terminals for the merchant
    const posRes = await fetch(`${BACKEND_URL}/api/v1/pos`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!posRes.ok) {
      throw new Error("Failed to fetch POS terminals");
    }

    const posTerminals = await posRes.json();
    return NextResponse.json(posTerminals);
  } catch (error) {
    console.error("Fetch POS terminals error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Create POS terminal for the merchant
    const posRes = await fetch(`${BACKEND_URL}/api/v1/pos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(body),
    });

    if (!posRes.ok) {
      const errorData = await posRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create POS terminal" },
        { status: posRes.status }
      );
    }

    const posTerminal = await posRes.json();
    return NextResponse.json(posTerminal, { status: 201 });
  } catch (error) {
    console.error("Create POS terminal error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
