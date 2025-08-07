"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart3,
  Building,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import HederaInfo from "@/components/admin/hedera-info";

interface DashboardStats {
  merchants: {
    total: number;
    active: number;
    recent: any[];
  };
  transactions: {
    completed: number;
    pending: number;
    failed: number;
  };
  volume: {
    totalVolume: number;
    monthlyGrowth: number;
  };
  users: {
    activeUsers: number;
    monthlyGrowth: number;
  };
  commission: {
    revenue: number;
    monthlyGrowth: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, Admin
            </h2>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back, Admin
            </h2>
            <p className="text-muted-foreground">
              Error loading dashboard: {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, Admin
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of the Zeppex platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/dashboard/merchants/new">Add New Merchant</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Merchants
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.merchants.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.merchants.active} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.volume.totalVolume.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.volume.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.users.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Commission Revenue
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.commission.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.commission.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Merchants</CardTitle>
            <CardDescription>
              Recently added merchants to the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats.merchants.recent.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No merchants found
              </p>
            ) : (
              stats.merchants.recent.map((merchant: any) => (
                <div key={merchant.id} className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {merchant.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {merchant.address}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-medium flex items-center justify-end gap-1">
                      {merchant.isActive ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Active
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-amber-500" />
                          Inactive
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(merchant.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard/merchants">
                  View All Merchants
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>
              Overview of transaction statuses across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {stats.transactions.completed}%
                </span>
              </div>
              <Progress value={stats.transactions.completed} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.transactions.pending}%
                </span>
              </div>
              <Progress value={stats.transactions.pending} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Failed</span>
                </div>
                <span className="text-sm font-medium">
                  {stats.transactions.failed}%
                </span>
              </div>
              <Progress value={stats.transactions.failed} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hedera Network Information */}
      <HederaInfo />
    </div>
  );
}
