"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Building, Home, LogOut, Percent, Settings, User, Users } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  const menuItems = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      label: "Merchants",
      href: "/admin/dashboard/merchants",
      icon: Building,
    },
    {
      label: "Commissions",
      href: "/admin/dashboard/commissions",
      icon: Percent,
    },
    {
      label: "Users",
      href: "/admin/dashboard/users",
      icon: Users,
    },
    {
      label: "Analytics",
      href: "/admin/dashboard/analytics",
      icon: BarChart3,
    },
  ]

  const accountMenuItems = [
    {
      label: "Profile",
      href: "/admin/dashboard/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/admin/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar className="border-r bg-background">
          <SidebarHeader className="justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="ml-2 text-xl font-bold group-data-[collapsed=true]:hidden">Zeppex</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label="Dashboard">
              {menuItems.map((item) => (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  active={
                    pathname.startsWith(item.href) && (item.href === "/admin/dashboard" ? pathname === item.href : true)
                  }
                  tooltip={item.label}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 truncate group-data-[collapsed=true]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarGroup>
            <SidebarGroup label="Account">
              {accountMenuItems.map((item) => (
                <SidebarMenuButton key={item.href} asChild active={pathname.startsWith(item.href)} tooltip={item.label}>
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 truncate group-data-[collapsed=true]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
              <div className="flex items-center w-full">
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="ml-2 truncate group-data-[collapsed=true]:hidden">Sign Out</span>
              </div>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold flex-1">Admin Dashboard</h1>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <User className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
