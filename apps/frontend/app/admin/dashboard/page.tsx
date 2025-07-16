import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Building, CheckCircle2, Clock, DollarSign, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, Admin</h2>
          <p className="text-muted-foreground">Here&apos;s an overview of the Zeppex platform.</p>
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
            <CardTitle className="text-sm font-medium">Total Merchants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$128,430.00</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,205</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,137.20</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Merchants</CardTitle>
            <CardDescription>Recently added merchants to the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Howtradethat</p>
                <p className="text-sm text-muted-foreground">Retail - 3 locations</p>
              </div>
              <div className="ml-auto text-right">
                <div className="font-medium flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Active
                </div>
                <div className="text-xs text-muted-foreground">2 days ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Tech Gadgets Inc</p>
                <p className="text-sm text-muted-foreground">Electronics - 1 location</p>
              </div>
              <div className="ml-auto text-right">
                <div className="font-medium flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Active
                </div>
                <div className="text-xs text-muted-foreground">5 days ago</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                <Building className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">Fitness First</p>
                <p className="text-sm text-muted-foreground">Fitness - 2 locations</p>
              </div>
              <div className="ml-auto text-right">
                <div className="font-medium flex items-center justify-end gap-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Pending
                </div>
                <div className="text-xs text-muted-foreground">1 week ago</div>
              </div>
            </div>
            <div className="pt-2 flex justify-center">
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard/merchants">View All Merchants</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Overview of transaction statuses across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Completed</span>
                </div>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Progress value={10} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Failed</span>
                </div>
                <span className="text-sm font-medium">5%</span>
              </div>
              <Progress value={5} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
