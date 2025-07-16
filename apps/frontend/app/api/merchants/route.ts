import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = cookies().get("session")?.value;

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
