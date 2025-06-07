"use client";

import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";
import UserForm from "@/components/admin/UserForm";

interface CreateUserPageProps {
  params: {
    id: string; // tenant ID
  };
}

function CreateUserPageContent({ params }: CreateUserPageProps) {
  return <UserForm tenantId={params.id} />;
}

const CreateUserPage = withNextAuth(CreateUserPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.TENANT_ADMIN],
  loginUrl: "/admin/login",
});

export default CreateUserPage;
