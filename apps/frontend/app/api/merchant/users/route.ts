import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch users for the merchant
    const usersRes = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!usersRes.ok) {
      throw new Error("Failed to fetch users");
    }

    const users = await usersRes.json();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
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

    // Create user for the merchant
    const userRes = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(body),
    });

    if (!userRes.ok) {
      const errorData = await userRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create user" },
        { status: userRes.status }
      );
    }

    const user = await userRes.json();
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
