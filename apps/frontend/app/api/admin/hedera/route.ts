import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch token info
    const tokenRes = await fetch(`${BACKEND_URL}/api/v1/treasury/token-info`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to fetch token info");
    }

    const tokenInfo = await tokenRes.json();

    // For now, we'll use hardcoded account data since there's no direct endpoint for treasury account info
    // In a real implementation, you'd want to create a backend endpoint for this
    const accountData = {
      accountId: tokenInfo.treasuryAccountId || "0.0.123456",
      publicKey: "302a300506032b6570032100...", // This would come from backend
      hbarBalance: "1000.0", // This would come from backend
      tokenBalance: tokenInfo.totalSupply || "0", // This would come from backend
    };

    return NextResponse.json({
      token: {
        tokenId: tokenInfo.tokenId,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply,
        treasuryAccountId: tokenInfo.treasuryAccountId,
      },
      account: accountData,
      network: "testnet", // This should come from backend configuration
    });
  } catch (error) {
    console.error("Hedera data fetch error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
