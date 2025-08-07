import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get current user info to get merchantId
    const userRes = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch user info");
    }

    const user = await userRes.json();
    const merchantId = user.merchantId;

    if (!merchantId) {
      throw new Error("User has no merchant association");
    }

    // Fetch merchant balance summary
    const balanceRes = await fetch(
      `${BACKEND_URL}/api/v1/treasury/balance-summary`,
      {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      }
    );

    if (!balanceRes.ok) {
      const errorText = await balanceRes.text();
      console.error(
        "Backend balance summary error:",
        balanceRes.status,
        errorText
      );
      throw new Error(
        `Failed to fetch balance summary: ${balanceRes.status} ${errorText}`
      );
    }

    const balanceData = await balanceRes.json();

    // Calculate total balance in USD (assuming 1 ZEPPEX token = $1 for now)
    const totalZeppexBalance = parseFloat(
      balanceData.totalZeppexTokenBalance || "0"
    );
    const totalBalanceUSD = totalZeppexBalance; // 1:1 ratio for now

    // Calculate branch balances
    const branchBalances = balanceData.branchBalances || [];
    const totalBranchBalance = branchBalances.reduce(
      (sum: number, branch: any) => {
        return sum + parseFloat(branch.zeppexTokenBalance || "0");
      },
      0
    );

    return NextResponse.json({
      totalBalance: totalBalanceUSD.toFixed(2),
      totalZeppexBalance: totalZeppexBalance.toFixed(6),
      totalHbarBalance: balanceData.totalHbarBalance || "0",
      branchBalances: branchBalances.map((branch: any) => ({
        id: branch.branchId,
        name: branch.branchName,
        zeppexBalance: parseFloat(branch.zeppexTokenBalance || "0").toFixed(6),
        hbarBalance: branch.hbarBalance || "0",
        lastUpdate: branch.lastBalanceUpdate,
      })),
      lastUpdate:
        balanceData.branchBalances?.[0]?.lastBalanceUpdate ||
        new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fetch merchant balance error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
