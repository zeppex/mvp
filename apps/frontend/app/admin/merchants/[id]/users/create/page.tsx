"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

interface CreateUserPageProps {
  params: { id: string };
}

function CreateUserPageContent({ params }: CreateUserPageProps) {
  const merchantId = params.id;
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/merchants/${merchantId}/users`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create User</h1>
          <p className="text-muted-foreground">
            Add a new user to this merchant
          </p>
        </div>
      </div>

      {/* User Form */}
      <UserForm merchantId={merchantId} />
    </div>
  );
}

// Create a protected version of the component
const CreateUserPage = withNextAuth(CreateUserPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN],
  loginUrl: "/admin/login",
});

export default CreateUserPage;
