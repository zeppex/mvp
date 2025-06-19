"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserForm from "@/components/admin/UserForm";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

interface EditUserPageProps {
  params: { id: string; userId: string };
}

function EditUserPageContent({ params }: EditUserPageProps) {
  const { id: merchantId, userId } = params;
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
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">Update user information</p>
        </div>
      </div>

      {/* User Form */}
      <UserForm userId={userId} merchantId={merchantId} />
    </div>
  );
}

// Create a protected version of the component
const EditUserPage = withNextAuth(EditUserPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.BRANCH_ADMIN],
  loginUrl: "/admin/login",
});

export default EditUserPage;
