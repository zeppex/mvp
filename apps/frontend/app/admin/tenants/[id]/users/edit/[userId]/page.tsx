"use client";

import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import UserForm from "@/components/admin/UserForm";

interface EditUserPageProps {
  params: {
    id: string; // tenant ID
    userId: string; // user ID
  };
}

function EditUserPageContent({ params }: EditUserPageProps) {
  return <UserForm tenantId={params.id} userId={params.userId} />;
}

const EditUserPage = withNextAuth(EditUserPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.TENANT_ADMIN],
  loginUrl: "/admin/login",
});

export default EditUserPage;
