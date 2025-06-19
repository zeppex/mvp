"use client";

import MerchantForm from "@/components/admin/MerchantForm";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

function CreateMerchantPageContent() {
  return <MerchantForm />;
}

// Create a protected version of the component
const CreateMerchantPage = withNextAuth(CreateMerchantPageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default CreateMerchantPage;
