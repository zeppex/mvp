"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Building } from "lucide-react";
import merchantApi, { CreateMerchantDto } from "@/lib/merchant-api";
import tenantApi, { Tenant } from "@/lib/tenant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

function CreateMerchantPageContent() {
  const [formData, setFormData] = useState<CreateMerchantDto>({
    name: "",
    address: "",
    contact: "",
    contactName: "",
    contactPhone: "",
    tenantId: "",
  });
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setTenantsLoading(true);
      const tenantsData = await tenantApi.getAllTenants();
      setTenants(tenantsData);
    } catch (err) {
      setError("Failed to load tenants. Please try again.");
      console.error("Error fetching tenants:", err);
    } finally {
      setTenantsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateMerchantDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Merchant name is required.");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required.");
      return false;
    }
    if (!formData.contact.trim()) {
      setError("Contact email is required.");
      return false;
    }
    if (!formData.contactName.trim()) {
      setError("Contact name is required.");
      return false;
    }
    if (!formData.contactPhone.trim()) {
      setError("Contact phone is required.");
      return false;
    }
    if (!formData.tenantId) {
      setError("Please select a tenant.");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await merchantApi.createMerchant(formData);
      
      // Redirect to merchants list with success message
      router.push("/admin/merchants?created=true");
    } catch (err: any) {
      console.error("Error creating merchant:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create merchant. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/merchants");
  };

  const getTenantDisplayName = (tenant: Tenant) => {
    return tenant.displayName || tenant.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Merchants
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Create Merchant</h1>
        <p className="text-muted-foreground">
          Add a new merchant to the platform
        </p>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Merchant Information</span>
          </CardTitle>
          <CardDescription>
            Enter the details for the new merchant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Merchant Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Store"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant *</Label>
                <Select
                  value={formData.tenantId}
                  onValueChange={(value) => handleInputChange("tenantId", value)}
                  disabled={loading || tenantsLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {getTenantDisplayName(tenant)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Main Street, Springfield"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  placeholder="e.g., John Doe"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange("contactName", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  placeholder="e.g., +1 (555) 123-4567"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Email *</Label>
              <Input
                id="contact"
                type="email"
                placeholder="e.g., contact@acmestore.com"
                value={formData.contact}
                onChange={(e) => handleInputChange("contact", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading || tenantsLoading}
                className="flex-1"
              >
                {loading ? "Creating..." : "Create Merchant"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Create a protected version of the component with withNextAuth
const CreateMerchantPage = withNextAuth(CreateMerchantPageContent, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default CreateMerchantPage;
