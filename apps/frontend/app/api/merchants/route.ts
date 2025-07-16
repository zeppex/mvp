import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiRes = await fetch(`${BACKEND_URL}/api/v1/merchants`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch merchants" },
        { status: apiRes.status }
      );
    }

    const merchants = await apiRes.json();
    return NextResponse.json(merchants);
  } catch (error) {
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

    // Transform frontend form data to match backend DTO
    const merchantData = {
      name: body.name,
      address: body.address,
      contact: body.contact,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
    };

    const apiRes = await fetch(`${BACKEND_URL}/api/v1/merchants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session}`,
      },
      body: JSON.stringify(merchantData),
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to create merchant" },
        { status: apiRes.status }
      );
    }

    const merchant = await apiRes.json();
    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    console.error("Create merchant error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
