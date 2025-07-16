import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch merchants for statistics
    const merchantsRes = await fetch(`${BACKEND_URL}/api/v1/merchants`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!merchantsRes.ok) {
      throw new Error("Failed to fetch merchants");
    }

    const merchants = await merchantsRes.json();

    // Calculate statistics
    const totalMerchants = merchants.length;
    const activeMerchants = merchants.filter((m: any) => m.isActive).length;
    const recentMerchants = merchants
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    // TODO: Fetch transaction statistics from backend when available
    // For now, using placeholder data
    const transactionStats = {
      completed: 85,
      pending: 10,
      failed: 5,
    };

    // TODO: Fetch volume and user statistics from backend when available
    const volumeStats = {
      totalVolume: 128430.0,
      monthlyGrowth: 12.5,
    };

    const userStats = {
      activeUsers: 1205,
      monthlyGrowth: 18,
    };

    const commissionStats = {
      revenue: 5137.2,
      monthlyGrowth: 8.2,
    };

    return NextResponse.json({
      merchants: {
        total: totalMerchants,
        active: activeMerchants,
        recent: recentMerchants,
      },
      transactions: transactionStats,
      volume: volumeStats,
      users: userStats,
      commission: commissionStats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
