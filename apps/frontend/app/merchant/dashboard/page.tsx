"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckCircle2,
  Clock,
  DollarSign,
  XCircle,
  Users,
  Building2,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardStats {
  merchant: {
    id: string;
    name: string;
    address: string;
    contact: string;
    contactName: string;
    contactPhone: string;
    isActive: boolean;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    todaySales: string;
    todayCount: number;
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    totalVolume: string;
  };
  recentTransactions: Array<{
    id: string;
    amount: string;
    status: string;
    description: string;
    date: string;
    exchange: string;
  }>;
  paymentMethods: Array<{
    name: string;
    percentage: number;
    color: string;
  }>;
}

export default function MerchantDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/merchant/dashboard/stats");
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
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
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
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">
              Error loading dashboard data
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
      case "PENDING":
      case "ACTIVE":
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case "FAILED":
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return (
          <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900";
      case "PENDING":
      case "ACTIVE":
      case "IN_PROGRESS":
        return "bg-amber-100 dark:bg-amber-900";
      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 dark:bg-red-900";
      default:
        return "bg-green-100 dark:bg-green-900";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {stats.merchant.contactName || "Merchant"}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your payment activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/merchant/dashboard/pos">Create Payment</Link>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="administration">Administration</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Balance
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.transactions.totalVolume}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total completed payment orders
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today&apos;s Sales
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.orders.todaySales}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.orders.todayCount} transactions today
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.orders.completed}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.transactions.completed} transactions
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.orders.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.transactions.pending} awaiting confirmation
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your most recent payment activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentTransactions.length > 0 ? (
                    stats.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {transaction.status === "COMPLETED"
                              ? "Payment Received"
                              : transaction.status === "PENDING"
                              ? "Payment Pending"
                              : transaction.status === "FAILED"
                              ? "Payment Failed"
                              : "Transaction"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.description} - {transaction.exchange}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          <div className="flex items-center">
                            {transaction.status === "COMPLETED" ? (
                              <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                            ) : transaction.status === "FAILED" ? (
                              <XCircle className="mr-1 h-4 w-4 text-red-500" />
                            ) : (
                              <Clock className="mr-1 h-4 w-4 text-amber-500" />
                            )}
                            ${transaction.amount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimeAgo(transaction.date)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No recent transactions
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/merchant/dashboard/transactions">
                      View All Transactions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Distribution of payment methods used
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.paymentMethods.map((method) => (
                    <div key={method.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${method.color}`}
                          ></div>
                          <span className="text-sm">{method.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {method.percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 mt-1">
                        <div
                          className={`h-2 rounded-full ${method.color}`}
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                Detailed analytics will be displayed here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Analytics content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and view reports</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Reports content coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="administration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Users Management
                </CardTitle>
                <CardDescription>
                  Manage your merchant users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Create, edit, and manage user accounts with different roles
                    and permissions.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/merchant/dashboard/users">Manage Users</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Branches Management
                </CardTitle>
                <CardDescription>
                  Manage your merchant branches and locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Add new branches, update locations, and manage
                    branch-specific settings.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/merchant/dashboard/branches">
                      Manage Branches
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  POS Terminals
                </CardTitle>
                <CardDescription>
                  Manage your point of sale terminals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Create and manage POS terminals, view payment links, and
                    track performance.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/merchant/dashboard/pos-terminals">
                      Manage POS Terminals
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
