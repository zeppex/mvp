import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    const branchId = searchParams.get("branchId");

    let url = `${BACKEND_URL}/api/v1/admin/users`;
    const params = new URLSearchParams();

    if (merchantId) {
      params.append("merchantId", merchantId);
    }
    if (branchId) {
      params.append("branchId", branchId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch users" },
        { status: apiRes.status }
      );
    }

    const users = await apiRes.json();
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
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Transform frontend form data to match backend CreateUserDto
    const userData = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      role: body.role,
      merchantId: body.merchantId,
      branchId: body.branchId,
      posId: body.posId,
    };

    const apiRes = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(userData),
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create user" },
        { status: apiRes.status }
      );
    }

    const user = await apiRes.json();
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
