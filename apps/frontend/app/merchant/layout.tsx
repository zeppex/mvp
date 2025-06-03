"use client";

import { NavBar } from "@/components/NavBar";
import { ToastProvider } from "@/components/ui/toast";
import TokenRefreshListener from "@/components/auth/TokenRefreshListener";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1 bg-secondary/10 p-6">{children}</main>
      <ToastProvider />
      <TokenRefreshListener />
    </div>
  );
}
