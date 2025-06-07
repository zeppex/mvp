"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Building2,
  Save,
} from "lucide-react";
import merchantApi, { CreateBranchDto } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useToast } from "@/hooks/use-toast";

function CreateBranchPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateBranchDto>({
    name: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreateBranchDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Branch name is required";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required";
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      await merchantApi.createBranch(merchantId, formData);
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
      router.push(`/admin/merchants/${merchantId}`);
    } catch (error) {
      console.error("Error creating branch:", error);
      toast({
        title: "Error",
        description: "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/merchants/${merchantId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Merchant
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Branch</h1>
          <p className="text-muted-foreground">
            Add a new branch to this merchant
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Branch Information
            </CardTitle>
            <CardDescription>
              Enter the details for the new branch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">
                    Branch Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Downtown Branch, Main Store"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Street address, City, State, ZIP"
                    rows={3}
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                    placeholder="branch@example.com"
                    className={errors.contactEmail ? "border-destructive" : ""}
                  />
                  {errors.contactEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.contactEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Whether this branch is currently active and operational
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/admin/merchants/${merchantId}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create Branch"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withNextAuth(CreateBranchPage);
