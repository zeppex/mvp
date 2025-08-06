import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ posId: string }> }
) {
  try {
    const { posId } = await params;
    const session = (await cookies()).get("session")?.value;

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/pos/${posId}`, {
      headers: {
        Authorization: `Bearer ${session}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch POS terminal" },
        { status: response.status }
      );
    }

    const posTerminal = await response.json();
    return NextResponse.json(posTerminal);
  } catch (error) {
    console.error("Error fetching POS terminal:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ posId: string }> }
) {
  try {
    const { posId } = await params;
    const session = (await cookies()).get("session")?.value;

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/v1/pos/${posId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to update POS terminal" },
        { status: response.status }
      );
    }

    const updatedPosTerminal = await response.json();
    return NextResponse.json(updatedPosTerminal);
  } catch (error) {
    console.error("Error updating POS terminal:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ posId: string }> }
) {
  try {
    const { posId } = await params;
    const session = (await cookies()).get("session")?.value;

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/pos/${posId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Failed to delete POS terminal" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "POS terminal deleted successfully" });
  } catch (error) {
    console.error("Error deleting POS terminal:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
