import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

// Fallback data with correct token information
const FALLBACK_DATA = {
  token: {
    tokenId: "0.0.6513627",
    name: "Zeppex Token",
    symbol: "ZEPPEX",
    decimals: 6,
    totalSupply: "15241.772980",
    treasuryAccountId: "0.0.6466583",
  },
  account: {
    accountId: "0.0.6466583",
    publicKey: "302a300506032b6570032100...",
    hbarBalance: "1000.0",
    tokenBalance: "0", // Treasury doesn't hold any tokens - they're distributed to branches
  },
  network: "testnet",
};

export async function GET(request: Request) {
  const session = (await cookies()).get("session")?.value;

  if (!session) {
    // Return fallback data if no session (for development/testing)
    return NextResponse.json(FALLBACK_DATA);
  }

  try {
    // Fetch token info
    const tokenRes = await fetch(`${BACKEND_URL}/api/v1/treasury/token-info`, {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    if (!tokenRes.ok) {
      console.warn("Failed to fetch token info, using fallback data");
      return NextResponse.json(FALLBACK_DATA);
    }

    const tokenInfo = await tokenRes.json();

    // Fetch treasury account info
    const accountRes = await fetch(
      `${BACKEND_URL}/api/v1/treasury/treasury-account-info`,
      {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      }
    );

    let accountData = {
      accountId: tokenInfo.treasuryAccountId || "0.0.6466583",
      publicKey: "302a300506032b6570032100...",
      hbarBalance: "0",
      tokenBalance: "0",
    };

    if (accountRes.ok) {
      const accountInfo = await accountRes.json();
      accountData = {
        accountId: accountInfo.accountId,
        publicKey: accountInfo.publicKey,
        hbarBalance: accountInfo.hbarBalance,
        tokenBalance: accountInfo.tokenBalance,
      };
    } else {
      console.warn(
        "Failed to fetch treasury account info, using fallback data"
      );
    }

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
      network: "testnet",
    });
  } catch (error) {
    console.error("Hedera data fetch error:", error);
    // Return fallback data on error
    return NextResponse.json(FALLBACK_DATA);
  }
}
