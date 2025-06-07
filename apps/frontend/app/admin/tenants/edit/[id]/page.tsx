"use client";

import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import { EditTenantPage } from "@/components/admin/TenantForm";

function TenantEditPageContent({ params }: { params: { id: string } }) {
  return <EditTenantPage params={params} />;
}

const TenantEditPage = withNextAuth(TenantEditPageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default TenantEditPage;
