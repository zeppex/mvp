"use client";

import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { CreateTenantPage } from "@/components/admin/TenantForm";

function TenantCreatePageContent() {
  return <CreateTenantPage />;
}

const TenantCreatePage = withNextAuth(TenantCreatePageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default TenantCreatePage;
