import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiRes = await fetch(
      `${BACKEND_URL}/api/v1/merchants/${params.merchantId}`,
      {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      }
    );

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch merchant" },
        { status: apiRes.status }
      );
    }

    const merchant = await apiRes.json();
    return NextResponse.json(merchant);
  } catch (error) {
    console.error("Fetch merchant error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
