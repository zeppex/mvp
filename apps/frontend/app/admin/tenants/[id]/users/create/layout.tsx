"use client";

import { ReactNode } from "react";
import AdminDashboardLayout from "../../../../dashboard/layout";

export default function AdminTenantUserCreateLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Reuse the admin dashboard layout
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
