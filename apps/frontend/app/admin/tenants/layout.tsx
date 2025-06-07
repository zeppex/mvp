"use client";

import { ReactNode } from "react";

export default function AdminTenantsLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This layout doesn't add anything specific to the tenants section
  // It just passes the children through to be rendered inside the parent admin layout
  return <>{children}</>;
}
