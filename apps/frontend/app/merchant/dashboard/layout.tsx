"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CreditCard,
  Home,
  LogOut,
  QrCode,
  Settings,
  User,
  Wallet,
  Users,
  Building2,
  Store,
} from "lucide-react";
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export default function MerchantDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/merchant/login");
  };

  const menuItems = [
    {
      label: "Overview",
      href: "/merchant/dashboard",
      icon: Home,
    },
    {
      label: "Point of Sale",
      href: "/merchant/dashboard/pos",
      icon: QrCode,
    },
    {
      label: "Transactions",
      href: "/merchant/dashboard/transactions",
      icon: CreditCard,
    },
    {
      label: "Balance",
      href: "/merchant/dashboard/balance",
      icon: Wallet,
    },
    {
      label: "Analytics",
      href: "/merchant/dashboard/analytics",
      icon: BarChart3,
    },
  ];

  const adminMenuItems = [
    {
      label: "Users",
      href: "/merchant/dashboard/users",
      icon: Users,
    },
    {
      label: "Branches",
      href: "/merchant/dashboard/branches",
      icon: Building2,
    },
    {
      label: "POS Terminals",
      href: "/merchant/dashboard/pos-terminals",
      icon: Store,
    },
  ];

  const accountMenuItems = [
    {
      label: "Profile",
      href: "/merchant/dashboard/profile",
      icon: User,
    },
    {
      label: "Settings",
      href: "/merchant/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <Sidebar className="border-r bg-background">
          <SidebarHeader className="justify-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="ml-2 text-xl font-bold group-data-[collapsed=true]:hidden">
                Zeppex
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup label="Dashboard">
              {menuItems.map((item) => (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  active={
                    pathname.startsWith(item.href) &&
                    (item.href === "/merchant/dashboard"
                      ? pathname === item.href
                      : true)
                  }
                  tooltip={item.label}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 truncate group-data-[collapsed=true]:hidden">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarGroup>
            <SidebarGroup label="Administration">
              {adminMenuItems.map((item) => (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  active={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 truncate group-data-[collapsed=true]:hidden">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarGroup>
            <SidebarGroup label="Account">
              {accountMenuItems.map((item) => (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  active={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="ml-2 truncate group-data-[collapsed=true]:hidden">
                      {item.label}
                    </span>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenuButton onClick={handleLogout} tooltip="Sign Out">
              <div className="flex items-center w-full">
                <LogOut className="h-4 w-4 shrink-0" />
                <span className="ml-2 truncate group-data-[collapsed=true]:hidden">
                  Sign Out
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold flex-1">Merchant Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <User className="h-4 w-4" />
              <span>Merchant Admin</span>
            </Button>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
