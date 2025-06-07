"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import tenantApi, {
  Tenant,
  CreateTenantDto,
  UpdateTenantDto,
} from "@/lib/tenant-api";
import { withNextAuth } from "@/components/withNextAuth";
import { UserRole } from "@/types/enums";

const tenantSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Name can only contain lowercase letters, numbers, and hyphens",
    }),
  displayName: z
    .string()
    .min(3, { message: "Display name must be at least 3 characters" }),
  isActive: z.boolean().default(true),
});

interface TenantFormProps {
  tenantId?: string;
}

function TenantForm({ tenantId }: TenantFormProps) {
  const router = useRouter();
  const isEditing = !!tenantId;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof tenantSchema>>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      displayName: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchTenant = async () => {
      if (!isEditing) return;

      try {
        setLoading(true);
        const tenant = await tenantApi.getTenant(tenantId);
        form.reset({
          name: tenant.name,
          displayName: tenant.displayName,
          isActive: tenant.isActive,
        });
      } catch (err) {
        setError("Failed to load tenant details");
        console.error("Error fetching tenant:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId, isEditing, form]);

  const onSubmit = async (data: z.infer<typeof tenantSchema>) => {
    try {
      setLoading(true);

      if (isEditing) {
        const updateData: UpdateTenantDto = {
          displayName: data.displayName,
          isActive: data.isActive,
        };
        await tenantApi.updateTenant(tenantId, updateData);
      } else {
        const createData: CreateTenantDto = {
          name: data.name,
          displayName: data.displayName,
          isActive: data.isActive,
        };
        await tenantApi.createTenant(createData);
      }

      router.push("/admin/tenants");
    } catch (err) {
      setError(`Failed to ${isEditing ? "update" : "create"} tenant`);
      console.error(
        `Error ${isEditing ? "updating" : "creating"} tenant:`,
        err
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Edit Tenant" : "Create Tenant"}
        </h1>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Tenant Details" : "Create New Tenant"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update the tenant information"
              : "Fill in the details to create a new tenant"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tenant-name"
                        {...field}
                        disabled={isEditing || loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tenant Display Name"
                        {...field}
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Is this tenant active and able to use the platform?
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push("/admin/tenants")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Update Tenant"
                    : "Create Tenant"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrapper page components for create and edit routes
export function CreateTenantPage() {
  return <TenantForm />;
}

export function EditTenantPage({ params }: { params: { id: string } }) {
  return <TenantForm tenantId={params.id} />;
}

const ProtectedTenantForm = withNextAuth(TenantForm, {
  requiredRoles: [UserRole.SUPERADMIN],
  loginUrl: "/admin/login",
});

export default ProtectedTenantForm;
