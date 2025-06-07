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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Monitor,
  Save,
} from "lucide-react";
import merchantApi, { CreatePosDto } from "@/lib/merchant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { useToast } from "@/hooks/use-toast";

function CreatePosPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;
  const branchId = params.branchId as string;
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreatePosDto>({
    name: "",
    serialNumber: "",
    location: "",
    status: "offline",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof CreatePosDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "POS device name is required";
    }

    if (!formData.serialNumber?.trim()) {
      newErrors.serialNumber = "Serial number is required";
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
      await merchantApi.createPosDevice(merchantId, branchId, formData);
      toast({
        title: "Success",
        description: "POS device created successfully",
      });
      router.push(`/admin/merchants/${merchantId}/branches/${branchId}`);
    } catch (error) {
      console.error("Error creating POS device:", error);
      toast({
        title: "Error",
        description: "Failed to create POS device",
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
          onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Branch
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New POS Device</h1>
          <p className="text-muted-foreground">
            Add a new POS device to this branch
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              POS Device Information
            </CardTitle>
            <CardDescription>
              Enter the details for the new POS device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="name">
                    Device Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Register 1, Front Counter POS"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="serialNumber">
                    Serial Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    placeholder="e.g., ZPX-2024-001"
                    className={errors.serialNumber ? "border-destructive" : ""}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.serialNumber}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Unique identifier for this POS device
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Front Counter, Self-Service Area"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Physical location within the branch
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange("status", value as "online" | "offline" | "maintenance")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current operational status of the device
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Whether this POS device is enabled for use
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
                  onClick={() => router.push(`/admin/merchants/${merchantId}/branches/${branchId}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Creating..." : "Create POS Device"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withNextAuth(CreatePosPage);
