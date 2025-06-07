"use client";

import { ReactNode } from "react";
import AdminDashboardLayout from "../../dashboard/layout";

export default function AdminTenantsCreateLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Reuse the admin dashboard layout
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
}
