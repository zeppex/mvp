import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: { posId: string } }
) {
  const session = cookies().get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");
    const branchId = searchParams.get("branchId");

    let url = `${BACKEND_URL}/api/v1/pos/${params.posId}`;
    const queryParams = new URLSearchParams();

    if (merchantId) {
      queryParams.append("merchantId", merchantId);
    }
    if (branchId) {
      queryParams.append("branchId", branchId);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch POS" },
        { status: apiRes.status }
      );
    }

    const pos = await apiRes.json();
    return NextResponse.json(pos);
  } catch (error) {
    console.error("Fetch POS error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
