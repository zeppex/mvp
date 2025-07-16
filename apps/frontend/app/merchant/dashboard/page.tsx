import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowUpIcon, CheckCircle2, Clock, DollarSign, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MerchantDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, John</h2>
          <p className="text-muted-foreground">Here&apos;s an overview of your payment activity</p>
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
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,231.89</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$652.00</div>
                <p className="text-xs text-muted-foreground">12 transactions today</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-xs text-muted-foreground">+19% from last week</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">2 awaiting confirmation</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your most recent payment activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Payment Received</p>
                      <p className="text-sm text-muted-foreground">2 Venti Lattes - $10.00</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="flex items-center">
                        <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                        $10.00
                      </div>
                      <div className="text-xs text-muted-foreground">5 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Payment Received</p>
                      <p className="text-sm text-muted-foreground">Cappuccino - $4.50</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="flex items-center">
                        <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
                        $4.50
                      </div>
                      <div className="text-xs text-muted-foreground">20 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Payment Pending</p>
                      <p className="text-sm text-muted-foreground">Mocha Frappuccino - $6.75</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-amber-500" />
                        $6.75
                      </div>
                      <div className="text-xs text-muted-foreground">35 minutes ago</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900">
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Payment Failed</p>
                      <p className="text-sm text-muted-foreground">Iced Coffee - $3.25</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="flex items-center">
                        <XCircle className="mr-1 h-4 w-4 text-red-500" />
                        $3.25
                      </div>
                      <div className="text-xs text-muted-foreground">1 hour ago</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900">
                      <ArrowDownIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Refund Issued</p>
                      <p className="text-sm text-muted-foreground">Chai Latte - $5.25</p>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="flex items-center">
                        <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
                        $5.25
                      </div>
                      <div className="text-xs text-muted-foreground">2 hours ago</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/merchant/dashboard/transactions">View All Transactions</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment methods used</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Binance Pay</span>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-blue-500" style={{ width: "68%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm">Coinbase</span>
                    </div>
                    <span className="text-sm font-medium">22%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: "22%" }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Crypto.com</span>
                    </div>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-2 rounded-full bg-purple-500" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed analytics will be displayed here</CardDescription>
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
      </Tabs>
    </div>
  )
}
