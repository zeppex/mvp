import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  try {
    const apiRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return NextResponse.json(
        { message: errorData.message || "Invalid email or password" },
        { status: apiRes.status }
      );
    }

    const data = await apiRes.json();
    const { accessToken, refreshToken, user } = data;

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    const session = accessToken;
    const cookieStore = await cookies();

    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
