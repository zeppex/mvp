"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  RefreshCw,
  Coins,
  Wallet,
  Network,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface HederaTokenInfo {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  treasuryAccountId: string;
}

interface HederaAccountInfo {
  accountId: string;
  publicKey: string;
  hbarBalance: string;
  tokenBalance: string;
}

interface HederaData {
  token: HederaTokenInfo;
  account: HederaAccountInfo;
  network: string;
}

// Fallback data if API fails
const FALLBACK_DATA: HederaData = {
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

export default function HederaInfo() {
  const [hederaData, setHederaData] = useState<HederaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchHederaData = async () => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      const response = await fetch("/api/admin/hedera");
      if (!response.ok) {
        throw new Error("Failed to fetch Hedera data");
      }
      const data = await response.json();
      setHederaData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setHederaData(FALLBACK_DATA);
      setUsingFallback(true);
      toast.error("Using fallback data - API unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHederaData();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatBalance = (balance: string, decimals: number = 6) => {
    const num = parseFloat(balance);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  };

  const getBlockExplorerUrl = (network: string) => {
    switch (network) {
      case "mainnet":
        return "https://hashscan.io";
      case "testnet":
        return "https://hashscan.io/testnet";
      case "previewnet":
        return "https://hashscan.io/previewnet";
      default:
        return "https://hashscan.io/testnet";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Hedera Network Information</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!hederaData) return null;

  const blockExplorerBase = getBlockExplorerUrl(hederaData.network);
  const tokenExplorerUrl = `${blockExplorerBase}/token/${hederaData.token.tokenId}`;
  const accountExplorerUrl = `${blockExplorerBase}/account/${hederaData.account.accountId}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Hedera Network Information</h3>
          {usingFallback && (
            <Badge variant="secondary" className="text-xs">
              Demo Data
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Network className="h-3 w-3" />
            {hederaData.network}
          </Badge>
          <Button onClick={fetchHederaData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Token Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token Information
            </CardTitle>
            <CardDescription>
              Zeppex token details and supply information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Token Name
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.name}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Token Symbol
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.symbol}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Token ID
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.tokenId}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(hederaData.token.tokenId, "Token ID")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(tokenExplorerUrl, "_blank")}
                  title="View on HashScan"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Total Supply
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.totalSupply} {hederaData.token.symbol}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Decimals
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.decimals}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Treasury Account ID
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.token.treasuryAccountId}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      hederaData.token.treasuryAccountId,
                      "Treasury Account ID"
                    )
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Treasury Account
            </CardTitle>
            <CardDescription>
              Hedera treasury account details and balances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Account ID
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.account.accountId}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(hederaData.account.accountId, "Account ID")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(accountExplorerUrl, "_blank")}
                  title="View on HashScan"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Public Key
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1 truncate">
                  {hederaData.account.publicKey}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(hederaData.account.publicKey, "Public Key")
                  }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                HBAR Balance
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {formatBalance(hederaData.account.hbarBalance)} ℏ
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Token Balance
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded flex-1">
                  {hederaData.account.tokenBalance} {hederaData.token.symbol}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
