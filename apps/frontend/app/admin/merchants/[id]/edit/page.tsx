"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import MerchantForm from "@/components/admin/MerchantForm";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

interface EditMerchantPageProps {
  params: { id: string };
}

function EditMerchantPageContent({ params }: EditMerchantPageProps) {
  const merchantId = params.id;
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/merchants/${merchantId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Merchant
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Merchant</h1>
          <p className="text-muted-foreground">Update merchant information</p>
        </div>
      </div>

      {/* Merchant Form */}
      <MerchantForm merchantId={merchantId} />
    </div>
  );
}

// Create a protected version of the component
const EditMerchantPage = withNextAuth(EditMerchantPageContent, {
  requiredRoles: [UserRole.SUPERADMIN, UserRole.ADMIN],
  loginUrl: "/admin/login",
});

export default EditMerchantPage;
