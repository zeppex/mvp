import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const merchantId = searchParams.get("merchantId");

    let url = `${BACKEND_URL}/api/v1/branches/${branchId}`;
    if (merchantId) {
      url += `?merchantId=${merchantId}`;
    }

    const apiRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch branch" },
        { status: apiRes.status }
      );
    }

    const branch = await apiRes.json();
    return NextResponse.json(branch);
  } catch (error) {
    console.error("Fetch branch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
