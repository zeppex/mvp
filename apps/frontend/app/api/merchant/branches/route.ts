import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch branches for the merchant
    const branchesRes = await fetch(`${BACKEND_URL}/api/v1/branches`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!branchesRes.ok) {
      throw new Error("Failed to fetch branches");
    }

    const branches = await branchesRes.json();
    return NextResponse.json(branches);
  } catch (error) {
    console.error("Fetch branches error:", error);
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

    // Create branch for the merchant
    const branchRes = await fetch(`${BACKEND_URL}/api/v1/branches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(body),
    });

    if (!branchRes.ok) {
      const errorData = await branchRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create branch" },
        { status: branchRes.status }
      );
    }

    const branch = await branchRes.json();
    return NextResponse.json(branch, { status: 201 });
  } catch (error) {
    console.error("Create branch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
