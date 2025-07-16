import type { ReactNode } from "react"
import Link from "next/link"
import { BarChart3, CreditCard, Home, LogOut, QrCode, Settings, User, Wallet } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export default function MerchantDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-xl font-bold">Zeppex</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label="Dashboard">
              <SidebarMenuButton asChild tooltip="Overview">
                <Link href="/merchant/dashboard">
                  <Home />
                  <span>Overview</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Point of Sale">
                <Link href="/merchant/dashboard/pos">
                  <QrCode />
                  <span>Point of Sale</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Transactions">
                <Link href="/merchant/dashboard/transactions">
                  <CreditCard />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Balance">
                <Link href="/merchant/dashboard/balance">
                  <Wallet />
                  <span>Balance</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Analytics">
                <Link href="/merchant/dashboard/analytics">
                  <BarChart3 />
                  <span>Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarGroup>
            <SidebarGroup label="Account">
              <SidebarMenuButton asChild tooltip="Profile">
                <Link href="/merchant/dashboard/profile">
                  <User />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/merchant/dashboard/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenuButton asChild tooltip="Sign Out">
              <Link href="/">
                <LogOut />
                <span>Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold flex-1">Merchant Dashboard</h1>
            <Button variant="outline" size="sm">
              <User className="mr-2 h-4 w-4" />
              Starbucks - Unicenter 2
            </Button>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
